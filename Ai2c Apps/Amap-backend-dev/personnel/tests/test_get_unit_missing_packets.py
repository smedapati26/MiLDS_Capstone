from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.models import Event
from personnel.api.unit_health.routes import router
from personnel.model_utils import MaintenanceLevel
from utils.tests import (
    create_single_test_event,
    create_test_mos_code,
    create_test_soldier,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("GetUnitMissingPackets")
class TestMissingPacketsEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.unit_health.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(uic="W12345", short_name="Parent Unit", display_name="Parent Test Unit")
        self.child_unit = create_testing_unit(
            uic="W12346", short_name="Child Unit", display_name="Child Test Unit", parent_unit=self.parent_unit
        )

        self.parent_unit.set_all_unit_lists()
        self.child_unit.set_all_unit_lists()

        self.mos_15R = create_test_mos_code(mos="15R", mos_description="Attack Helicopter Repairer")
        self.mos_15T = create_test_mos_code(mos="15T", mos_description="UH-60 Helicopter Repairer")

        self.today = date.today()
        self.start_date = self.today - timedelta(days=30)
        self.end_date = self.today + timedelta(days=30)

        self.soldier_with_packet = create_test_soldier(
            unit=self.parent_unit, user_id="1234567890", first_name="John", last_name="Doe", primary_mos=self.mos_15R
        )

        self.soldier_without_packet = create_test_soldier(
            unit=self.parent_unit, user_id="0987654321", first_name="Jane", last_name="Smith", primary_mos=self.mos_15T
        )

        self.soldier_in_child_unit = create_test_soldier(
            unit=self.child_unit, user_id="1122334455", first_name="Bob", last_name="Johnson", primary_mos=self.mos_15T
        )

        self.event1 = create_single_test_event(
            soldier=self.soldier_with_packet,
            recorded_by=self.soldier_with_packet,
            uic=self.parent_unit,
            id=1,
            date_time=self.today - timedelta(days=10),
            maintenance_level=MaintenanceLevel.ML2,
        )

        self.get_user_id.return_value = self.soldier_with_packet.user_id

        create_user_role_in_all(soldier=self.soldier_with_packet, units=[self.parent_unit])

    def test_get_missing_packets_parent_unit(self):
        """Test the endpoint returns only soldiers without packets in the specified unit"""

        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/missing_packets?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        result = response.json()

        # Verify all soldiers in the unit and subordinates are returned
        self.assertEqual(len(result), 3)

        # Find soldiers by user_id instead of assuming order
        soldier_with_packet_result = next((s for s in result if s["user_id"] == self.soldier_with_packet.user_id), None)
        soldier_without_packet_result = next(
            (s for s in result if s["user_id"] == self.soldier_without_packet.user_id), None
        )
        soldier_in_child_result = next((s for s in result if s["user_id"] == self.soldier_in_child_unit.user_id), None)

        # Verify soldier with packet
        self.assertIsNotNone(soldier_with_packet_result)
        self.assertEqual(soldier_with_packet_result["name"], self.soldier_with_packet.name_and_rank())
        self.assertEqual(soldier_with_packet_result["packet_status"], "Uploaded")
        self.assertEqual(soldier_with_packet_result["unit"], self.parent_unit.short_name)

        # Verify soldier without packet
        self.assertIsNotNone(soldier_without_packet_result)
        self.assertEqual(soldier_without_packet_result["name"], self.soldier_without_packet.name_and_rank())
        self.assertEqual(soldier_without_packet_result["packet_status"], "Missing")
        self.assertEqual(soldier_without_packet_result["unit"], self.parent_unit.short_name)

        # Verify child unit soldier
        self.assertIsNotNone(soldier_in_child_result)
        self.assertEqual(soldier_in_child_result["packet_status"], "Missing")
        self.assertEqual(soldier_in_child_result["unit"], self.child_unit.short_name)

    def test_get_missing_packets_child_unit(self):
        """Test the endpoint returns only soldiers from the specified unit, not including parent/child units"""
        response = self.client.get(
            f"/unit/{self.child_unit.uic}/missing_packets?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        result = response.json()

        # Verify only the soldier in child unit is returned
        self.assertEqual(len(result), 1)

        # Verify it's the correct soldier
        missing_packet = result[0]
        self.assertEqual(missing_packet["user_id"], self.soldier_in_child_unit.user_id)
        self.assertEqual(missing_packet["unit"], self.child_unit.short_name)

    def test_no_missing_packets(self):
        """Test when all soldiers have packets"""
        # Create event for the other soldiers so they now have packets
        self.event2 = create_single_test_event(
            soldier=self.soldier_without_packet,
            recorded_by=self.soldier_with_packet,
            uic=self.parent_unit,
            id=2,
            date_time=self.today - timedelta(days=5),
            maintenance_level=MaintenanceLevel.ML1,
        )

        self.event3 = create_single_test_event(
            soldier=self.soldier_in_child_unit,
            recorded_by=self.soldier_with_packet,
            uic=self.child_unit,
            id=3,
            date_time=self.today - timedelta(days=5),
            maintenance_level=MaintenanceLevel.ML1,
        )

        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/missing_packets?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        result = response.json()

        # Verify all soldiers in unit and subordinates are returned
        self.assertEqual(len(result), 3)

    def test_invalid_unit(self):
        """Test with an invalid UIC"""
        response = self.client.get(
            f"/unit/INVALID/missing_packets?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 404)
