from datetime import date, datetime

from django.test import Client, TestCase
from django.utils.timezone import make_aware
from ninja.testing import TestClient

from aircraft.api.fhp.routes import fhp_router
from aircraft.models import Aircraft, Airframe, Flight
from auto_dsr.models import Unit
from events.model_utils import TrainingTypes
from events.models import TrainingEvent
from utils.tests import create_test_units, create_test_user


class TestOperationsEndpoint(TestCase):
    def setUp(self):
        units, _ = create_test_units()
        self.unit = units[0]
        self.user = create_test_user(self.unit)
        self.client = TestClient(fhp_router, headers={"Auth-User": self.user.user_id})
        self.operation = TrainingEvent.objects.create(
            name="Test Operation",
            unit=self.unit,
            training_type=TrainingTypes.OPERATION,
            event_start=make_aware(datetime(2024, 1, 1)),
            event_end=make_aware(datetime(2024, 2, 1)),
        )

        # Create Airframe first
        self.airframe = Airframe.objects.create(mds="UH-60M", model="UH-60M", family="UH-60")

        # Link Airframe to Aircraft
        self.aircraft = Aircraft.objects.create(
            serial="TEST123",
            model="UH-60M",
            airframe=self.airframe,
            current_unit=self.unit,
            total_airframe_hours=1000.0,
            hours_to_phase=100.0,
            last_sync_time=make_aware(datetime.now()),
            last_export_upload_time=make_aware(datetime.now()),
            last_update_time=make_aware(datetime.now()),
        )

        self.flight = Flight.objects.create(
            flight_id="TEST-123",
            aircraft=self.aircraft,
            unit=self.unit,
            mission_type="TRAINING",
            start_datetime=make_aware(datetime(2024, 1, 15)),
            stop_datetime=make_aware(datetime(2024, 1, 15, 5)),
            status_date=make_aware(datetime(2024, 1, 15)),
            total_hours=5.0,
        )

    def test_get_operations_basic(self):
        """Test basic functionality of operations endpoint"""
        response = self.client.get(f"/operations?uic={self.unit.uic}")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data["events"]), 1)

        event = data["events"][0]
        self.assertEqual(event["name"], "Test Operation")
        self.assertEqual(event["total_hours"], 5.0)

        model_details = event["model_details"]
        self.assertEqual(len(model_details), 1)
        self.assertEqual(model_details[0]["aircraft_model"], "UH-60M")
        self.assertEqual(model_details[0]["amount"], 1)
        self.assertEqual(model_details[0]["hours_flown"], 5.0)

    def test_get_operations_date_filter(self):
        """Test operations endpoint with date filtering"""
        response = self.client.get(f"/operations?uic={self.unit.uic}&start_date=2024-03-01&end_date=2024-04-01")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data["events"]), 0)
