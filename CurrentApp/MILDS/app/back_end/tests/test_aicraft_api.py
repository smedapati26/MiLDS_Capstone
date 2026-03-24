# app/back_end/tests/test_aircraft_api.py
import json
from django.test import TestCase,Client
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

    def test_aircraft_list_returns_expected_fields(self):
        url = reverse("aircraft-list")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

        first = data[0]
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
        url = reverse("aircraft-detail", kwargs={"pk": self.ac1.pk})
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["model_name"], "UH-60M")
        self.assertEqual(data["status"], "FMC")
        self.assertEqual(data["current_unit"], "WDDRA0")

    def test_aircraft_patch_updates_allowed_fields(self):
        """
        PATCH /api/aircraft/<pk>/ should update allowed fields and return updated JSON.
        """
        url = reverse("aircraft-detail", kwargs={"pk": self.ac1.pk})
        payload = {"status": "NMC", "rtl": "NRTL", "hours_to_phase": 12.25, "remarks": "Test"}

        resp = self.client.patch(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 200)

        self.ac1.refresh_from_db()
        self.assertEqual(self.ac1.status, "NMC")
        self.assertEqual(self.ac1.rtl, "NRTL")
        self.assertAlmostEqual(self.ac1.hours_to_phase, 12.25)
        self.assertEqual(self.ac1.remarks, "Test")

        out = resp.json()
        self.assertEqual(out["status"], "NMC")
        self.assertEqual(out["rtl"], "NRTL")

    def test_aircraft_patch_invalid_date_down_returns_400(self):
        url = reverse("aircraft-detail", kwargs={"pk": self.ac1.pk})
        payload = {"date_down": "02-02-2026"}  # wrong format; your view expects YYYY-MM-DD

        resp = self.client.patch(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("date_down", resp.json().get("detail", ""))

    def test_aircraft_patch_only_invalid_fields_returns_400(self):
        """
        Your view ignores unknown fields; if nothing valid remains => 400.
        """
        url = reverse("aircraft-detail", kwargs={"pk": self.ac1.pk})
        payload = {"not_a_real_field": "x"}

        resp = self.client.patch(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("No valid fields", resp.json().get("detail", ""))




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
