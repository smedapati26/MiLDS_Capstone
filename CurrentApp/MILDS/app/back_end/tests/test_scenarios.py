# app/back_end/tests/test_scenarios.py
from django.test import TestCase
from django.urls import reverse

from app.back_end.models import (
    Aircraft,
    Scenario,
    ScenarioEvent,
    ScenarioRun,
    ScenarioRunLog,
)
from app.back_end.views import apply_scenario


class ScenarioApplyTests(TestCase):
    def setUp(self):
        self.ac = Aircraft.objects.create(
            aircraft_pk=2001,
            model_name="UH-60M",
            status="FMC",
            rtl="RTL",
            current_unit="WDDRA0",
        )
        self.scenario = Scenario.objects.create(
            name="Night Maintenance Surge",
            description="Test scenario: take aircraft down for training",
        )
        # Single event: mark our aircraft NMC with a remark
        self.event = ScenarioEvent.objects.create(
            scenario=self.scenario,
            aircraft=self.ac,
            status="NMC",
            rtl="NRTL",
            remarks="Down for training",
        )

    def test_apply_scenario_updates_aircraft_and_creates_run_and_log(self):
        """
        apply_scenario should:
        - create a ScenarioRun with correct counts
        - modify the aircraft according to ScenarioEvent
        - create a ScenarioRunLog with before/after snapshots
        """
        run = apply_scenario(self.scenario.id)

        # Run summary
        self.assertIsInstance(run, ScenarioRun)
        self.assertEqual(run.scenario, self.scenario)
        self.assertEqual(run.total_events, 1)
        self.assertEqual(run.applied_events, 1)

        # Aircraft updated
        self.ac.refresh_from_db()
        self.assertEqual(self.ac.status, "NMC")
        self.assertEqual(self.ac.rtl, "NRTL")
        self.assertEqual(self.ac.remarks, "Down for training")

        # Log created
        logs = ScenarioRunLog.objects.filter(run=run)
        self.assertEqual(logs.count(), 1)
        log = logs.first()
        self.assertEqual(log.aircraft_pk, self.ac.aircraft_pk)
        self.assertIn("status", log.before)
        self.assertIn("status", log.after)
        self.assertIn("Aircraft", log.message)


class ScenarioRevertTests(TestCase):
    def setUp(self):
        # Original aircraft state
        self.ac = Aircraft.objects.create(
            aircraft_pk=3001,
            model_name="UH-60M",
            status="FMC",
            rtl="RTL",
            current_unit="WDDRA0",
        )

        # Fake scenario + run
        self.scenario = Scenario.objects.create(
            name="Temp Scenario",
            description="Used for revert test",
        )
        self.run = ScenarioRun.objects.create(
            scenario=self.scenario,
            total_events=1,
            applied_events=1,
        )

        # Simulate that scenario changed aircraft status from FMC → NMC
        self.before_snapshot = {
            "status": "FMC",
            "rtl": "RTL",
            "remarks": "",
            "date_down": None,
        }
        self.after_snapshot = {
            "status": "NMC",
            "rtl": "NRTL",
            "remarks": "Down for test",
            "date_down": None,
        }

        # Apply the "after" state directly, as if scenario has been run
        self.ac.status = self.after_snapshot["status"]
        self.ac.rtl = self.after_snapshot["rtl"]
        self.ac.remarks = self.after_snapshot["remarks"]
        self.ac.save()

        ScenarioRunLog.objects.create(
            run=self.run,
            aircraft_pk=self.ac.aircraft_pk,
            message="Test log",
            before=self.before_snapshot,
            after=self.after_snapshot,
        )

    def test_revert_last_scenario_restores_aircraft_state(self):
        """
        /api/scenarios/revert-last/ should restore aircraft fields
        from the 'before' snapshot in ScenarioRunLog.
        """
        url = reverse("scenarios-revert-last")
        resp = self.client.post(url)

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get("ok"))
        self.assertEqual(data.get("run_id"), self.run.pk)
        self.assertEqual(data.get("restored"), 1)

        # Aircraft back to original state
        self.ac.refresh_from_db()
        self.assertEqual(self.ac.status, "FMC")
        self.assertEqual(self.ac.rtl, "RTL")
        self.assertEqual(self.ac.remarks, "")
        
    from django.test import TestCase
    
from django.urls import reverse
from app.back_end.models import Aircraft, Soldier, Scenario, ScenarioEvent
import json

class ScenarioCreateApiTests(TestCase):
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

    def test_create_scenario_with_aircraft_and_personnel_events(self):
        url = reverse("scenarios-api-list")
        payload = {
            "name": "API Create Test",
            "description": "Created via POST",
            "events": [
                {"target":"aircraft","aircraft_pk":4001,"status":"NMC","rtl":"NRTL","remarks":"Down"},
                {"target":"personnel","user_id":"123456789012","remarks":"Unavailable"},
            ]
        }
        resp = self.client.post(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 201)

        self.assertTrue(Scenario.objects.filter(name="API Create Test").exists())
        sc = Scenario.objects.get(name="API Create Test")
        self.assertEqual(sc.events.count(), 2)

