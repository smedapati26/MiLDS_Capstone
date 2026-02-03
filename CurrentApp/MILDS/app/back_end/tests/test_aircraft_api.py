# app/back_end/tests/test_aircraft_api.py

from django.test import TestCase, Client
from app.back_end.models import Aircraft


class AircraftListAPITest(TestCase):
    def setUp(self):
        self.client = Client()

        # Create a test aircraft
        Aircraft.objects.create(
            aircraft_pk=1,
            serial="TEST-0001",
            model_name="UH-60M",
            status="FMC",
            rtl="NRTL",
            current_unit="WDDRA0",
        )

    def test_aircraft_list_returns_aircraft(self):
        response = self.client.get("/api/aircraft/")

        self.assertEqual(response.status_code, 200)

        data = response.json()

        # Basic structure checks
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)

        aircraft = data[0]

        # Field checks
        self.assertEqual(aircraft["serial"], "TEST-0001")
        self.assertEqual(aircraft["model_name"], "UH-60M")
        self.assertEqual(aircraft["status"], "FMC")
        self.assertNotEqual(aircraft["serial"], aircraft["aircraft_pk"])
