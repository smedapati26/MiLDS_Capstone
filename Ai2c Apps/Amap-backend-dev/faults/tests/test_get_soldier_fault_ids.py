from datetime import datetime

from django.test import TestCase
from ninja.testing import TestClient

from faults.api.routes import router
from faults.models import Fault
from utils.tests import create_test_soldier, create_testing_unit


class TestSoldierFaultIdsEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        # Create test unit
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(self.unit)

    def test_soldier_with_faults(self):
        """Test soldier that has fault involvement returns fault IDs"""
        # Create a fault discovered by this soldier
        fault = Fault.objects.create(
            id="test-fault-guid-1",
            aircraft="TEST123",
            unit=self.unit,
            discovered_by_dodid=self.soldier,
            status_code="X",
            system_code="001",
            when_discovered_code="001",
            how_recognized_code="001",
            malfunction_effect_code="A",
            corrective_action_code="001",
            maintenance_level_code="O",
            discovery_date_time=datetime.now(),
            source="CAMMS",
        )

        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_ids")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("fault_ids", data)
        self.assertIn("test-fault-guid-1", data["fault_ids"])

    def test_soldier_with_no_faults(self):
        """Test soldier with no fault involvement returns empty list"""
        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_ids")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("fault_ids", data)
        self.assertEqual(data["fault_ids"], [])

    def test_nonexistent_soldier(self):
        """Test that endpoint handles nonexistent soldier gracefully"""
        response = self.client.get("/soldier/9999999999/fault_ids")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("fault_ids", data)
        self.assertEqual(data["fault_ids"], [])
