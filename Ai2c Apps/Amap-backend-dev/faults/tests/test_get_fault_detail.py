from datetime import date, datetime, timedelta

from django.test import TestCase
from django.utils import timezone
from ninja.testing import TestClient

from faults.api.routes import router
from faults.model_utils import (
    CorrectiveActionCodes,
    FailureCodes,
    FaultSource,
    FaultStatusCodes,
    HowRecognizedCodes,
    MaintenanceLevelCodes,
    MalfunctionEffectCodes,
    SystemCodes,
    WhenDiscoveredCodes,
)
from faults.models import Fault, FaultAction, MaintainerFaultAction
from utils.tests import create_test_soldier, create_testing_unit


class TestFaultDetailEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit(uic="W12345", short_name="Test Unit", display_name="Test Unit Display")

        self.discoverer = create_test_soldier(
            unit=self.unit, user_id="1234567890", first_name="John", last_name="Discoverer"
        )

        self.maintainer1 = create_test_soldier(
            unit=self.unit, user_id="1234567891", first_name="Jane", last_name="Maintainer"
        )

        self.maintainer2 = create_test_soldier(
            unit=self.unit, user_id="1234567892", first_name="Bob", last_name="Mechanic"
        )

        self.inspector = create_test_soldier(
            unit=self.unit, user_id="1234567893", first_name="Alice", last_name="Inspector"
        )

        self.closer = create_test_soldier(unit=self.unit, user_id="1234567894", first_name="Mike", last_name="Closer")

    def test_get_fault_detail_complete(self):
        """Test fault detail with complete data - all relationships populated"""
        fault = Fault.objects.create(
            id="TEST-FAULT-001",
            aircraft="ABC1234",
            unit=self.unit,
            discovered_by_name="John Discoverer",
            discovered_by_dodid=self.discoverer,
            status_code=FaultStatusCodes.X,
            system_code=SystemCodes.A,
            when_discovered_code=WhenDiscoveredCodes.B,
            how_recognized_code=HowRecognizedCodes.A,
            malfunction_effect_code=MalfunctionEffectCodes.ONE,
            failure_code=FailureCodes.GASSY,
            corrective_action_code=CorrectiveActionCodes.A,
            maintenance_level_code=MaintenanceLevelCodes.F,
            discovery_date_time=timezone.now() - timedelta(days=5),
            corrective_date_time=timezone.now() - timedelta(days=1),
            remarks="Test fault with complete data",
            fault_work_unit_code="TEST-WUC",
            total_man_hours=15.5,
            source=FaultSource.CAMMS,
        )

        action1 = FaultAction.objects.create(
            id="TEST-ACTION-001",
            associated_fault_id=fault,
            discovery_date_time=timezone.now() - timedelta(days=4),
            closed_date_time=timezone.now() - timedelta(days=2),
            closed_by=self.closer,
            maintenance_action="Replace component",
            corrective_action="Completed replacement",
            status_code=FaultStatusCodes.X,
            fault_work_unit_code="TEST-WUC-1",
            technical_inspector=self.inspector,
            maintenance_level_code=MaintenanceLevelCodes.F,
            corrective_action_code=CorrectiveActionCodes.A,
            sequence_number=1,
        )

        action2 = FaultAction.objects.create(
            id="TEST-ACTION-002",
            associated_fault_id=fault,
            discovery_date_time=timezone.now() - timedelta(days=3),
            closed_date_time=timezone.now() - timedelta(days=1),
            closed_by=self.closer,
            maintenance_action="Test component",
            corrective_action="Testing complete",
            status_code=FaultStatusCodes.X,
            fault_work_unit_code="TEST-WUC-2",
            technical_inspector=self.inspector,
            maintenance_level_code=MaintenanceLevelCodes.F,
            corrective_action_code=CorrectiveActionCodes.A,
            sequence_number=2,
        )

        MaintainerFaultAction.objects.create(fault_action=action1, soldier=self.maintainer1, man_hours=5.0)

        MaintainerFaultAction.objects.create(fault_action=action1, soldier=self.maintainer2, man_hours=3.5)

        MaintainerFaultAction.objects.create(fault_action=action2, soldier=self.maintainer1, man_hours=7.0)

        response = self.client.get(f"/fault/{fault.id}")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["fault_id"], "TEST-FAULT-001")
        self.assertEqual(data["discoverer_name"], "John Discoverer")
        self.assertEqual(data["aircraft"], "ABC1234")
        self.assertEqual(data["unit_name"], "Test Unit")
        self.assertEqual(data["fault_work_unit_code"], "TEST-WUC")
        self.assertEqual(data["total_man_hours"], 15.5)
        self.assertEqual(data["remarks"], "Test fault with complete data")

        self.assertEqual(len(data["fault_actions"]), 2)

        action1_data = data["fault_actions"][0]
        self.assertEqual(action1_data["fault_action_id"], "TEST-ACTION-001")
        self.assertEqual(action1_data["sequence_number"], 1)
        self.assertEqual(action1_data["closer_name"], "SFC Mike Closer")
        self.assertEqual(action1_data["maintenance_action"], "Replace component")
        self.assertEqual(action1_data["action_status"], "Completed replacement")
        self.assertEqual(action1_data["inspector_name"], "SFC Alice Inspector")
        self.assertEqual(action1_data["man_hours"], 8.5)  # 5.0 + 3.5
        self.assertEqual(action1_data["fault_work_unit_code"], "TEST-WUC-1")
        self.assertEqual(len(action1_data["maintainers"]), 2)

        action2_data = data["fault_actions"][1]
        self.assertEqual(action2_data["fault_action_id"], "TEST-ACTION-002")
        self.assertEqual(action2_data["sequence_number"], 2)
        self.assertEqual(action2_data["man_hours"], 7.0)
        self.assertEqual(len(action2_data["maintainers"]), 1)

    def test_get_fault_detail_minimal(self):
        """Test fault detail with minimal data - optional relationships null"""
        fault = Fault.objects.create(
            id="TEST-FAULT-002",
            status_code=FaultStatusCodes.X,
            system_code=SystemCodes.A,
            when_discovered_code=WhenDiscoveredCodes.B,
            how_recognized_code=HowRecognizedCodes.A,
            malfunction_effect_code=MalfunctionEffectCodes.ONE,
            corrective_action_code=CorrectiveActionCodes.A,
            maintenance_level_code=MaintenanceLevelCodes.F,
            discovery_date_time=timezone.now() - timedelta(days=2),
            total_man_hours=0.1,
            source=FaultSource.CAMMS,
        )

        action = FaultAction.objects.create(
            id="TEST-ACTION-003",
            associated_fault_id=fault,
            discovery_date_time=timezone.now() - timedelta(days=1),
            status_code=FaultStatusCodes.X,
            maintenance_level_code=MaintenanceLevelCodes.F,
            corrective_action_code=CorrectiveActionCodes.A,
            sequence_number=1,
        )

        response = self.client.get(f"/fault/{fault.id}")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["fault_id"], "TEST-FAULT-002")
        self.assertIsNone(data["discoverer_name"])
        self.assertIsNone(data["aircraft"])
        self.assertIsNone(data["corrected_on"])
        self.assertIsNone(data["unit_name"])
        self.assertIsNone(data["fault_work_unit_code"])
        self.assertIsNone(data["remarks"])

        self.assertEqual(len(data["fault_actions"]), 1)
        action_data = data["fault_actions"][0]
        self.assertIsNone(action_data["closed_on"])
        self.assertIsNone(action_data["closer_name"])
        self.assertIsNone(action_data["maintenance_action"])
        self.assertIsNone(action_data["inspector_name"])
        self.assertEqual(action_data["man_hours"], 0.0)
        self.assertEqual(len(action_data["maintainers"]), 0)

    def test_get_fault_detail_not_found(self):
        """Test 404 response for non-existent fault"""
        response = self.client.get("/fault/NONEXISTENT-FAULT")
        self.assertEqual(response.status_code, 404)

    def test_get_fault_detail_no_actions(self):
        """Test fault with no associated fault actions"""
        fault = Fault.objects.create(
            id="TEST-FAULT-003",
            status_code=FaultStatusCodes.X,
            system_code=SystemCodes.A,
            when_discovered_code=WhenDiscoveredCodes.B,
            how_recognized_code=HowRecognizedCodes.A,
            malfunction_effect_code=MalfunctionEffectCodes.ONE,
            corrective_action_code=CorrectiveActionCodes.A,
            maintenance_level_code=MaintenanceLevelCodes.F,
            discovery_date_time=timezone.now(),
            total_man_hours=0.1,
            source=FaultSource.CAMMS,
        )

        response = self.client.get(f"/fault/{fault.id}")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["fault_id"], "TEST-FAULT-003")
        self.assertEqual(len(data["fault_actions"]), 0)
