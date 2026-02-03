# app/back_end/tests/test_scenarios_api.py
import json
from django.test import TestCase
from django.urls import reverse
from app.back_end.models import Aircraft, Soldier, Scenario


class ScenarioApiTests(TestCase):
    def setUp(self):
        self.ac = Aircraft.objects.create(
            aircraft_pk=4001,
            model_name="UH-60M",
            status="FMC",
            rtl="RTL",
            current_unit="WDDRA0",
        )
        self.s = Soldier.objects.create(
            user_id="123456789012",
            rank="CPT",
            first_name="Jane",
            last_name="Doe",
            primary_mos="17A",
            current_unit="75 RR",
            is_maintainer=False,
        )

    def test_list_scenarios_includes_event_count(self):
        Scenario.objects.create(name="A", description="d")
        Scenario.objects.create(name="B", description="d")

        url = reverse("scenarios-api-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)
        self.assertIn("event_count", data[0])

    def test_create_scenario_success(self):
        url = reverse("scenarios-api-list")
        payload = {
            "name": "API Create Test",
            "description": "Created via POST",
            "events": [
                {"target": "aircraft", "aircraft_pk": 4001, "status": "NMC", "rtl": "NRTL", "remarks": "Down"},
                {"target": "personnel", "user_id": "123456789012", "remarks": "Unavailable"},
            ],
        }

        resp = self.client.post(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 201)

        self.assertTrue(Scenario.objects.filter(name="API Create Test").exists())
        sc = Scenario.objects.get(name="API Create Test")
        self.assertEqual(sc.events.count(), 2)

    def test_create_scenario_missing_name_returns_400(self):
        url = reverse("scenarios-api-list")
        payload = {"description": "x", "events": [{"target": "aircraft", "aircraft_pk": 4001, "status": "NMC"}]}

        resp = self.client.post(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("name", resp.json().get("detail", "").lower())

    def test_create_scenario_invalid_event_target_returns_400(self):
        url = reverse("scenarios-api-list")
        payload = {
            "name": "Bad Target",
            "description": "x",
            "events": [{"target": "vehicle", "aircraft_pk": 4001, "status": "NMC"}],
        }

        resp = self.client.post(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("target", resp.json().get("detail", "").lower())

    def test_create_scenario_duplicate_name_returns_409(self):
        Scenario.objects.create(name="Dupe", description="x")

        url = reverse("scenarios-api-list")
        payload = {
            "name": "Dupe",
            "description": "x",
            "events": [{"target": "aircraft", "aircraft_pk": 4001, "status": "NMC"}],
        }

        resp = self.client.post(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 409)
