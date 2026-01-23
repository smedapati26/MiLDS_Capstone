# app/back_end/tests/test_aircraft_api.py
from django.test import TestCase
from django.urls import reverse
from app.back_end.models import Aircraft


class AircraftApiTests(TestCase):
    def setUp(self):
        self.ac1 = Aircraft.objects.create(
            aircraft_pk=1001,
            model_name="UH-60M",
            status="FMC",
            rtl="RTL",
            current_unit="WDDRA0",
            hours_to_phase=25.5,
        )
        self.ac2 = Aircraft.objects.create(
            aircraft_pk=1002,
            model_name="CH-47F",
            status="NMC",
            rtl="NRTL",
            current_unit="WDDRA0",
            hours_to_phase=12.0,
        )

    def test_aircraft_list_returns_expected_fields(self):
        """
        /api/aircraft/ should return a JSON array of aircraft with
        the fields the frontend expects.
        """
        url = reverse("aircraft-list")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)

        first = data[0]
        # core fields the React table uses
        for field in [
            "pk",
            "aircraft_pk",
            "model_name",
            "status",
            "rtl",
            "current_unit",
            "hours_to_phase",
        ]:
            self.assertIn(field, first)

    def test_aircraft_detail_ok(self):
        """
        /api/aircraft/<pk>/ should return a single aircraft with details.
        """
        url = reverse("aircraft-detail", kwargs={"pk": self.ac1.pk})
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["model_name"], "UH-60M")
        self.assertEqual(data["status"], "FMC")
        self.assertEqual(data["current_unit"], "WDDRA0")

    def test_aircraft_detail_404(self):
        """
        Nonexistent pk should return 404.
        """
        url = reverse("aircraft-detail", kwargs={"pk": 999999})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 404)
