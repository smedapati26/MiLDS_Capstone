# app/back_end/tests/test_aircraft_inject.py

from django.test import TestCase, Client
from unittest.mock import patch
from app.back_end.models import Aircraft


class AircraftInjectAPITest(TestCase):
    def setUp(self):
        self.client = Client()

        self.aircraft = Aircraft.objects.create(
            aircraft_pk=10,
            serial="INJECT-0001",
            model_name="UH-60M",
            status="FMC",
            rtl="NRTL",
            current_unit="WDDRA0",
        )

    @patch("app.api.griffin_client.GriffinClient.inject_aircraft_update")
    def test_inject_nmc_updates_aircraft(self, mock_inject):
        mock_inject.return_value = {"success": True}

        response = self.client.post(
            f"/api/aircraft/inject/nmc?aircraft_pk={self.aircraft.aircraft_pk}"
        )

        self.assertEqual(response.status_code, 200)

        self.aircraft.refresh_from_db()
        self.assertEqual(self.aircraft.status, "NMC")