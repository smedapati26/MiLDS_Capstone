from datetime import datetime

from django.test import TestCase
from ninja.testing import TestClient

from faults.api.routes import router
from faults.models import Fault
from utils.tests import create_test_soldier, create_testing_unit


class TestSoldierFaultWucsEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(self.unit)

    def test_soldier_with_fault_wucs(self):
        """Test soldier that has fault involvement returns WUCs"""
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
            fault_work_unit_code="WUC123",
            source="CAMMS",
        )

        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_wucs")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("wucs", data)
        self.assertIn("WUC123", data["wucs"])

    def test_soldier_with_no_fault_wucs(self):
        """Test soldier with no fault involvement returns empty list"""
        response = self.client.get(f"/soldier/{self.soldier.user_id}/fault_wucs")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("wucs", data)
        self.assertEqual(data["wucs"], [])

    def test_nonexistent_soldier(self):
        """Test that endpoint handles nonexistent soldier gracefully"""
        response = self.client.get("/soldier/9999999999/fault_wucs")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("wucs", data)
        self.assertEqual(data["wucs"], [])
