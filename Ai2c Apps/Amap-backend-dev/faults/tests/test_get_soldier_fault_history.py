from datetime import datetime

from django.test import TestCase
from django.utils import timezone
from ninja.testing import TestClient

from faults.api.routes import router
from faults.models import Fault, FaultAction, MaintainerFaultAction
from utils.tests import create_test_soldier, create_testing_unit


class SoldierFaultHistoryTestCase(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        # Create test unit using utility function
        self.unit = create_testing_unit(uic="TEST001", short_name="Test Unit", display_name="Test Unit Display")

        # Create test soldiers using utility function
        self.soldier = create_test_soldier(unit=self.unit, user_id="1234567890", first_name="Test", last_name="Soldier")

        self.other_soldier = create_test_soldier(
            unit=self.unit, user_id="0987654321", first_name="Other", last_name="Soldier"
        )

        # Create test fault
        self.fault = Fault.objects.create(
            id="TEST-FAULT-001",
            aircraft="12345",
            unit=self.unit,
            discovered_by_name="Test Discoverer",
            discovered_by_dodid=self.soldier,
            status_code="O",
            system_code="001",
            when_discovered_code="001",
            how_recognized_code="001",
            malfunction_effect_code="A",
            corrective_action_code="001",
            maintenance_level_code="O",
            discovery_date_time=timezone.make_aware(datetime(2023, 1, 1, 10, 0, 0)),
            corrective_date_time=timezone.make_aware(datetime(2023, 1, 2, 15, 0, 0)),
            total_man_hours=2.5,
            source="TEST",
        )

        # Create test fault action
        self.fault_action = FaultAction.objects.create(
            id="TEST-ACTION-001",
            associated_fault_id=self.fault,
            discovery_date_time=timezone.make_aware(datetime(2023, 1, 1, 10, 0, 0)),
            closed_date_time=timezone.make_aware(datetime(2023, 1, 2, 15, 0, 0)),
            closed_by=self.other_soldier,
            maintenance_action="Test maintenance action",
            corrective_action="Test corrective action",
            status_code="C",
            technical_inspector=self.other_soldier,
            maintenance_level_code="O",
            corrective_action_code="001",
            sequence_number=1,
            source="TEST",
        )

    def test_soldier_not_found(self):
        """Test 404 when soldier doesn't exist"""
        response = self.client.get("/soldier/9999999999/fault_history")
        self.assertEqual(response.status_code, 404)

    def test_no_fault_history(self):
        """Test empty response when soldier has no fault history"""
        # Create soldier with no fault involvement using utility function
        new_soldier = create_test_soldier(unit=self.unit, user_id="1111111111", first_name="Clean", last_name="Soldier")

        response = self.client.get(f"/soldier/{new_soldier.user_id}/fault_history")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["fault_actions"]), 0)

    def test_maintainer_role(self):
        """Test soldier as maintainer"""
        # Add soldier as maintainer
        MaintainerFaultAction.objects.create(fault_action=self.fault_action, soldier=self.soldier, man_hours=1.5)

        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_history")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["fault_actions"]), 1)
        action = data["fault_actions"][0]
        self.assertEqual(action["role"], "Maintainer")
        self.assertEqual(action["man_hours"], 1.5)
        self.assertEqual(action["fault_action_id"], self.fault_action.id)

    def test_inspector_role(self):
        """Test soldier as inspector"""
        # Set soldier as technical inspector
        self.fault_action.technical_inspector = self.soldier
        self.fault_action.save()

        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_history")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["fault_actions"]), 1)
        action = data["fault_actions"][0]
        self.assertEqual(action["role"], "Inspector")
        self.assertIsNone(action["man_hours"])

    def test_closer_role(self):
        """Test soldier as closer"""
        # Set soldier as closer
        self.fault_action.closed_by = self.soldier
        self.fault_action.save()

        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_history")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["fault_actions"]), 1)
        action = data["fault_actions"][0]
        self.assertEqual(action["role"], "Closer")

    def test_reporter_role(self):
        """Test soldier as reporter (fault discoverer)"""
        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_history")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["fault_actions"]), 1)
        action = data["fault_actions"][0]
        self.assertEqual(action["role"], "Reporter")

    def test_role_priority(self):
        """Test that maintainer role takes priority over other roles"""
        # Make soldier both reporter and maintainer
        MaintainerFaultAction.objects.create(fault_action=self.fault_action, soldier=self.soldier, man_hours=2.0)

        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_history")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["fault_actions"]), 1)
        action = data["fault_actions"][0]
        self.assertEqual(action["role"], "Maintainer")  # Should prioritize maintainer over reporter
        self.assertEqual(action["man_hours"], 2.0)

    def test_fault_details_structure(self):
        """Test that fault details are properly nested"""
        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_history")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        action = data["fault_actions"][0]
        fault_details = action["fault_details"]

        # Check required fields
        self.assertEqual(fault_details["fault_id"], self.fault.id)
        self.assertEqual(fault_details["aircraft"], "12345")
        self.assertEqual(fault_details["unit"], "Test Unit")
        self.assertEqual(fault_details["discoverer"], "Test Discoverer")
        self.assertEqual(fault_details["discover_date"], "2023-01-01")
        self.assertEqual(fault_details["corrective_date"], "2023-01-02")
        self.assertEqual(fault_details["total_man_hours"], 2.5)

    def test_multiple_fault_actions(self):
        """Test soldier with multiple fault actions"""
        # Create second fault and action
        fault2 = Fault.objects.create(
            id="TEST-FAULT-002",
            aircraft="67890",
            unit=self.unit,
            discovered_by_dodid=self.other_soldier,
            status_code="O",
            system_code="002",
            when_discovered_code="002",
            how_recognized_code="002",
            malfunction_effect_code="B",
            corrective_action_code="002",
            maintenance_level_code="O",
            discovery_date_time=timezone.make_aware(datetime(2023, 1, 1, 10, 0, 0)),
            total_man_hours=1.0,
            source="TEST",
        )

        action2 = FaultAction.objects.create(
            id="TEST-ACTION-002",
            associated_fault_id=fault2,
            discovery_date_time=timezone.make_aware(datetime(2023, 2, 1, 10, 0, 0)),
            closed_by=self.soldier,  # Soldier closes this one
            status_code="O",
            maintenance_level_code="O",
            corrective_action_code="002",
            sequence_number=1,
            source="TEST",
        )

        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_history")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["fault_actions"]), 2)
        roles = [action["role"] for action in data["fault_actions"]]
        self.assertIn("Reporter", roles)
        self.assertIn("Closer", roles)
