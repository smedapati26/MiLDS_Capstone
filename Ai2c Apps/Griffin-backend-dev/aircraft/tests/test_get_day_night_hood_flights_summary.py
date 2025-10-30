from datetime import datetime

from django.test import TestCase
from django.utils.timezone import make_aware
from ninja.testing import TestClient

from aircraft.api.fhp.routes import fhp_router
from aircraft.models import Unit
from utils.tests import create_single_test_aircraft, create_single_test_flight, create_test_user


class TestFlightHours(TestCase):
    def setUp(self):
        self.parent_unit = Unit.objects.create(
            uic="PARENT123", short_name="Parent Unit", display_name="Parent Test Unit", echelon="BATTALION"
        )
        self.child_unit = Unit.objects.create(
            uic="CHILD456",
            short_name="Child Unit",
            display_name="Child Test Unit",
            echelon="COMPANY",
            parent_uic=self.parent_unit,
        )

        self.parent_unit.set_all_unit_lists()
        self.child_unit.set_all_unit_lists()
        self.aircraft = create_single_test_aircraft(serial="12345", model="TEST-AC", current_unit=self.parent_unit)
        self.base_date = make_aware(datetime(2024, 1, 1))
        create_single_test_flight(
            aircraft=self.aircraft,
            unit=self.parent_unit,
            flight_id="TEST1",
            status_date=self.base_date,
            start_datetime=self.base_date,
            stop_datetime=self.base_date,
            flight_D_hours=2.0,
            flight_N_hours=1.5,
            flight_H_hours=0.5,
            flight_W_hours=1.0,
            total_hours=5.0,
        )

        self.user = create_test_user(unit=self.parent_unit)
        self.client = TestClient(fhp_router, headers={"Auth-User": self.user.user_id})

    def test_get_combined_flight_hours_basic(self):
        """Test basic functionality of combined flight hours endpoint"""
        response = self.client.get(
            f"/flight-hours-summary?uic={self.parent_unit.uic}" f"&start_date=2024-01-01&end_date=2024-01-31"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Verify response structure
        for flight_type in ["day", "night", "hood", "weather"]:
            self.assertIn(flight_type, data)
            type_data = data[flight_type]
            self.assertIn("fiscal_year_to_date", type_data)
            self.assertIn("reporting_period", type_data)
            self.assertIn("models", type_data)
            self.assertIsInstance(type_data["models"], list)

        # Verify specific hour values
        self.assertEqual(data["day"]["reporting_period"], 2.0)
        self.assertEqual(data["night"]["reporting_period"], 1.5)
        self.assertEqual(data["hood"]["reporting_period"], 0.5)
        self.assertEqual(data["weather"]["reporting_period"], 1.0)

        # Verify model breakdown
        self.assertEqual(len(data["day"]["models"]), 1)
        model_data = data["day"]["models"][0]
        self.assertEqual(model_data["model"], "TEST-AC")
        self.assertEqual(model_data["hours"], 2.0)

    def test_get_combined_flight_hours_no_dates(self):
        """Test endpoint works without explicit dates"""
        response = self.client.get(f"/flight-hours-summary?uic={self.parent_unit.uic}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("day", data)
        self.assertIn("night", data)
        self.assertIn("hood", data)
        self.assertIn("weather", data)

    def test_get_combined_flight_hours_child_unit(self):
        """Test endpoint returns correct data for child unit"""
        child_flight = create_single_test_flight(
            aircraft=self.aircraft,
            unit=self.child_unit,
            flight_id="TEST2",
            status_date=self.base_date,
            start_datetime=self.base_date,
            stop_datetime=self.base_date,
            flight_D_hours=1.0,
            flight_N_hours=0.5,
            flight_H_hours=0.2,
            flight_W_hours=0.3,
            total_hours=2.0,
        )
        response = self.client.get(
            f"/flight-hours-summary?uic={self.child_unit.uic}" f"&start_date=2024-01-01&end_date=2024-01-31"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["day"]["reporting_period"], 1.0)
        self.assertEqual(data["night"]["reporting_period"], 0.5)
        self.assertEqual(data["hood"]["reporting_period"], 0.2)
        self.assertEqual(data["weather"]["reporting_period"], 0.3)
