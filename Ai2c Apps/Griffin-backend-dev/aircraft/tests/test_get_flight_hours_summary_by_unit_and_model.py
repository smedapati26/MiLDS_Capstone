from datetime import date, datetime

from django.test import TestCase
from django.utils.timezone import make_aware
from ninja.testing import TestClient

from aircraft.api.fhp.routes import fhp_router
from aircraft.models import DA_1352, Aircraft
from auto_dsr.models import Unit, UnitEchelon
from fhp.models import MonthlyPrediction, MonthlyProjection
from utils.tests import create_test_units, create_test_user


class TestFlightHours(TestCase):
    def setUp(self):
        self.units, _ = create_test_units()
        self.parent_unit = Unit.objects.get(uic="TSUNFF")
        self.child_unit = Unit.objects.get(uic="TEST000AA")

        self.user = create_test_user(unit=self.parent_unit)

        self.client = TestClient(fhp_router, headers={"Auth-User": self.user.user_id})

        self.year = 2024
        self.start_date = date(2023, 10, 1)
        self.end_date = date(2024, 9, 30)

        self.aircraft = Aircraft.objects.create(
            serial="12345",
            model="TEST-AC",
            current_unit=self.parent_unit,
            total_airframe_hours=100.0,
            hours_to_phase=50.0,
            last_sync_time=make_aware(datetime.now()),
            last_export_upload_time=make_aware(datetime.now()),
            last_update_time=make_aware(datetime.now()),
        )

        self.create_test_data()

    def create_test_data(self):
        DA_1352.objects.create(
            serial_number=self.aircraft,
            reporting_uic=self.parent_unit,
            reporting_month=date(2024, 1, 15),
            model_name="TEST-AC",
            flying_hours=10.0,
            fmc_hours=20.0,
            field_hours=0.0,
            pmcm_hours=0.0,
            pmcs_hours=0.0,
            dade_hours=0.0,
            sust_hours=0.0,
            nmcs_hours=0.0,
            nmcm_hours=0.0,
            total_hours_in_status_per_month=30.0,
            total_reportable_hours_in_month=30.0,
            source="TEST",
        )

        MonthlyProjection.objects.create(
            unit=self.parent_unit,
            model="TEST-AC",
            reporting_month=date(2024, 1, 15),
            projected_hours=15.0,
            source="TEST",
        )

        MonthlyPrediction.objects.create(
            unit=self.parent_unit,
            mds="TEST-AC",
            reporting_month=date(2024, 1, 15),
            predicted_hours=12.0,
            model="AI_MODEL",
            prediction_date=date(2024, 1, 1),
        )

    def test_get_flight_hours_basic(self):
        """Test basic functionality of flight hours endpoint"""
        response = self.client.get(f"/fhp-progress?uic={self.parent_unit.uic}&year={self.year}")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn("unit", data)
        self.assertIn("models", data)

        unit_data = data["unit"]
        self.assertTrue(len(unit_data) > 0)
        first_month = unit_data[0]
        self.assertIn("date", first_month)
        self.assertIn("actual_flight_hours", first_month)
        self.assertIn("projected_flight_hours", first_month)
        self.assertIn("predicted_flight_hours", first_month)

        models = data["models"]
        self.assertTrue(len(models) > 0)
        first_model = models[0]
        self.assertIn("model", first_model)
        self.assertIn("dates", first_model)
        self.assertTrue(len(first_model["dates"]) > 0)

    def test_get_flight_hours_child_unit(self):
        """Test flight hours endpoint with child unit"""
        response = self.client.get(f"/fhp-progress?uic={self.child_unit.uic}&year={self.year}")
        self.assertEqual(response.status_code, 200)

    def test_get_flight_hours_no_year(self):
        """Test flight hours endpoint without specifying year"""
        response = self.client.get(f"/fhp-progress?uic={self.parent_unit.uic}")
        self.assertEqual(response.status_code, 200)
