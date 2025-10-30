import json

from django.db import transaction
from django.test import TestCase, tag
from ninja.testing import TestClient

from auto_dsr.api.routes import auto_dsr_router
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import UserRole
from utils.tests import create_test_user
from utils.tests.test_aircraft_creation import create_test_aircraft_in_all
from utils.tests.test_phase_creation import phase_order_creation
from utils.tests.test_unit_creation import create_single_test_unit, create_test_units


@tag("auto_dsr", "phase_flow_ordering")
class InspectionReferenceTest(TestCase):
    def setUp(self):
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BDE",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )
        self.unit = self.units_created[0]

        # Create User for authentication
        self.user = create_test_user(unit=self.unit)
        unit_role, _ = UserRole.objects.get_or_create(user_id=self.user, unit=self.unit)
        unit_role.access_level = UserRoleAccessLevel.WRITE
        unit_role.save()

        self.second_user = create_test_user(user_id="999999999", unit=self.units_created[len(self.units_created) - 1])
        UserRole.objects.get_or_create(user_id=self.second_user, unit=self.unit)
        # Create Airframe to attach to Aircraft
        self.aircraft = create_test_aircraft_in_all(self.units_created)
        self.second_unit = create_single_test_unit()
        self.order = phase_order_creation(self.aircraft, self.unit, self.user)

        self.client = TestClient(auto_dsr_router, headers={"Auth-User": self.user.user_id})
        self.client2 = TestClient(auto_dsr_router, headers={"Auth-User": self.second_user.user_id})

    def test_get_phase_order(self):
        response = self.client.get(f"/phase-flow-order?uic={self.unit.uic}")
        self.assertEqual(response.status_code, 200)
        expected = [
            {"uic": "TEST000FF", "serial": "TEST000FFAIRCRAFT0", "phase_order": 0},
            {"uic": "TEST000FF", "serial": "TEST000AAAIRCRAFT1", "phase_order": 1},
            {"uic": "TEST000FF", "serial": "TEST000A0AIRCRAFT2", "phase_order": 2},
            {"uic": "TEST000FF", "serial": "TEST000B0AIRCRAFT3", "phase_order": 3},
            {"uic": "TEST000FF", "serial": "TEST000C0AIRCRAFT4", "phase_order": 4},
            {"uic": "TEST000FF", "serial": "TEST001AAAIRCRAFT5", "phase_order": 5},
            {"uic": "TEST000FF", "serial": "TEST001A0AIRCRAFT6", "phase_order": 6},
            {"uic": "TEST000FF", "serial": "TEST001B0AIRCRAFT7", "phase_order": 7},
            {"uic": "TEST000FF", "serial": "TEST001C0AIRCRAFT8", "phase_order": 8},
            {"uic": "TEST000FF", "serial": "TEST002AAAIRCRAFT9", "phase_order": 9},
            {"uic": "TEST000FF", "serial": "TEST002A0AIRCRAFT10", "phase_order": 10},
            {"uic": "TEST000FF", "serial": "TEST002B0AIRCRAFT11", "phase_order": 11},
            {"uic": "TEST000FF", "serial": "TEST002C0AIRCRAFT12", "phase_order": 12},
        ]
        self.assertEqual(response.data, expected)

    def test_reordering(self):
        with transaction.atomic():
            self.aircraft[5].uic.set([self.second_unit])
            self.aircraft[5].save()
            response = self.client.get(f"/phase-flow-order?uic={self.unit.uic}")
            self.assertEqual(response.status_code, 200)
            expected = [
                {"uic": "TEST000FF", "serial": "TEST000FFAIRCRAFT0", "phase_order": 0},
                {"uic": "TEST000FF", "serial": "TEST000AAAIRCRAFT1", "phase_order": 1},
                {"uic": "TEST000FF", "serial": "TEST000A0AIRCRAFT2", "phase_order": 2},
                {"uic": "TEST000FF", "serial": "TEST000B0AIRCRAFT3", "phase_order": 3},
                {"uic": "TEST000FF", "serial": "TEST000C0AIRCRAFT4", "phase_order": 4},
                {"uic": "TEST000FF", "serial": "TEST001A0AIRCRAFT6", "phase_order": 5},
                {"uic": "TEST000FF", "serial": "TEST001B0AIRCRAFT7", "phase_order": 6},
                {"uic": "TEST000FF", "serial": "TEST001C0AIRCRAFT8", "phase_order": 7},
                {"uic": "TEST000FF", "serial": "TEST002AAAIRCRAFT9", "phase_order": 8},
                {"uic": "TEST000FF", "serial": "TEST002A0AIRCRAFT10", "phase_order": 9},
                {"uic": "TEST000FF", "serial": "TEST002B0AIRCRAFT11", "phase_order": 10},
                {"uic": "TEST000FF", "serial": "TEST002C0AIRCRAFT12", "phase_order": 11},
            ]
            self.assertEqual(response.data, expected)

    def test_empty_phase_flow(self):
        with transaction.atomic():
            self.aircraft[5].uic.set([self.second_unit])
            self.aircraft[5].save()
            response = self.client.get(f"/phase-flow-order?uic={self.second_unit.uic}")
            self.assertEqual(response.status_code, 200)
            expected = []
            self.assertEqual(response.data, expected)

    def test_update(self):
        payload = [
            {"serial": "TEST000FFAIRCRAFT0", "phase_order": 4},
            {"serial": "TEST000AAAIRCRAFT1", "phase_order": 0},
            {"serial": "TEST000A0AIRCRAFT2", "phase_order": 8},
            {"serial": "TEST000B0AIRCRAFT3", "phase_order": 2},
            {"serial": "TEST000C0AIRCRAFT4", "phase_order": 6},
            {"serial": "TEST001AAAIRCRAFT5", "phase_order": 5},
            {"serial": "TEST001A0AIRCRAFT6", "phase_order": 7},
            {"serial": "TEST001B0AIRCRAFT7", "phase_order": 1},
            {"serial": "TEST001C0AIRCRAFT8", "phase_order": 3},
            {"serial": "TEST002AAAIRCRAFT9", "phase_order": 12},
            {"serial": "TEST002A0AIRCRAFT10", "phase_order": 11},
            {"serial": "TEST002B0AIRCRAFT11", "phase_order": 9},
            {"serial": "TEST002C0AIRCRAFT12", "phase_order": 10},
        ]
        response = self.client.post(
            f"/phase-flow-order?uic={self.unit.uic}", data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "message": "Phase order created."})

        # Verify the new order was updated
        response = self.client.get(f"/phase-flow-order?uic={self.unit.uic}")
        self.assertEqual(response.status_code, 200)
        expected = [
            {"uic": "TEST000FF", "serial": "TEST000AAAIRCRAFT1", "phase_order": 0},
            {"uic": "TEST000FF", "serial": "TEST001B0AIRCRAFT7", "phase_order": 1},
            {"uic": "TEST000FF", "serial": "TEST000B0AIRCRAFT3", "phase_order": 2},
            {"uic": "TEST000FF", "serial": "TEST001C0AIRCRAFT8", "phase_order": 3},
            {"uic": "TEST000FF", "serial": "TEST000FFAIRCRAFT0", "phase_order": 4},
            {"uic": "TEST000FF", "serial": "TEST001AAAIRCRAFT5", "phase_order": 5},
            {"uic": "TEST000FF", "serial": "TEST000C0AIRCRAFT4", "phase_order": 6},
            {"uic": "TEST000FF", "serial": "TEST001A0AIRCRAFT6", "phase_order": 7},
            {"uic": "TEST000FF", "serial": "TEST000A0AIRCRAFT2", "phase_order": 8},
            {"uic": "TEST000FF", "serial": "TEST002B0AIRCRAFT11", "phase_order": 9},
            {"uic": "TEST000FF", "serial": "TEST002C0AIRCRAFT12", "phase_order": 10},
            {"uic": "TEST000FF", "serial": "TEST002A0AIRCRAFT10", "phase_order": 11},
            {"uic": "TEST000FF", "serial": "TEST002AAAIRCRAFT9", "phase_order": 12},
        ]
        self.assertEqual(response.data, expected)

    def test_update_invalid_permissions(self):
        payload = [
            {"serial": "TEST000FFAIRCRAFT0", "phase_order": 4},
            {"serial": "TEST000AAAIRCRAFT1", "phase_order": 0},
            {"serial": "TEST000A0AIRCRAFT2", "phase_order": 8},
            {"serial": "TEST000B0AIRCRAFT3", "phase_order": 2},
            {"serial": "TEST000C0AIRCRAFT4", "phase_order": 6},
            {"serial": "TEST001AAAIRCRAFT5", "phase_order": 5},
            {"serial": "TEST001A0AIRCRAFT6", "phase_order": 7},
            {"serial": "TEST001B0AIRCRAFT7", "phase_order": 1},
            {"serial": "TEST001C0AIRCRAFT8", "phase_order": 3},
            {"serial": "TEST002AAAIRCRAFT9", "phase_order": 12},
            {"serial": "TEST002A0AIRCRAFT10", "phase_order": 11},
            {"serial": "TEST002B0AIRCRAFT11", "phase_order": 9},
            {"serial": "TEST002C0AIRCRAFT12", "phase_order": 10},
        ]
        response = self.client2.post(
            f"/phase-flow-order?uic={self.unit.uic}", data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.data,
            {"success": False, "message": "Only users with write access may create/update a phase flow order."},
        )

    def test_update_invalid_serial(self):
        payload = [
            {"serial": "TEST000FFAIRCRAFT0", "phase_order": 4},
            {"serial": "TEST000AAAIRCRAFT1", "phase_order": 0},
            {"serial": "TEST000A0AIRCRAFT2", "phase_order": 8},
            {"serial": "ABC123", "phase_order": 2},
            {"serial": "TEST000C0AIRCRAFT4", "phase_order": 6},
            {"serial": "TEST001AAAIRCRAFT5", "phase_order": 5},
            {"serial": "TEST001A0AIRCRAFT6", "phase_order": 7},
            {"serial": "TEST001B0AIRCRAFT7", "phase_order": 1},
            {"serial": "TEST001C0AIRCRAFT8", "phase_order": 3},
            {"serial": "TEST002AAAIRCRAFT9", "phase_order": 12},
            {"serial": "TEST002A0AIRCRAFT10", "phase_order": 11},
            {"serial": "TEST002B0AIRCRAFT11", "phase_order": 9},
            {"serial": "TEST002C0AIRCRAFT12", "phase_order": 10},
        ]
        response = self.client.post(
            f"/phase-flow-order?uic={self.unit.uic}", data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "message": "Phase order created."})

        # Verify the new order was updated
        response = self.client.get(f"/phase-flow-order?uic={self.unit.uic}")
        self.assertEqual(response.status_code, 200)
        expected = [
            {"uic": "TEST000FF", "serial": "TEST000AAAIRCRAFT1", "phase_order": 0},
            {"uic": "TEST000FF", "serial": "TEST001B0AIRCRAFT7", "phase_order": 1},
            {"uic": "TEST000FF", "serial": "TEST001C0AIRCRAFT8", "phase_order": 2},
            {"uic": "TEST000FF", "serial": "TEST000FFAIRCRAFT0", "phase_order": 3},
            {"uic": "TEST000FF", "serial": "TEST001AAAIRCRAFT5", "phase_order": 4},
            {"uic": "TEST000FF", "serial": "TEST000C0AIRCRAFT4", "phase_order": 5},
            {"uic": "TEST000FF", "serial": "TEST001A0AIRCRAFT6", "phase_order": 6},
            {"uic": "TEST000FF", "serial": "TEST000A0AIRCRAFT2", "phase_order": 7},
            {"uic": "TEST000FF", "serial": "TEST002B0AIRCRAFT11", "phase_order": 8},
            {"uic": "TEST000FF", "serial": "TEST002C0AIRCRAFT12", "phase_order": 9},
            {"uic": "TEST000FF", "serial": "TEST002A0AIRCRAFT10", "phase_order": 10},
            {"uic": "TEST000FF", "serial": "TEST002AAAIRCRAFT9", "phase_order": 11},
        ]
        self.assertEqual(response.data, expected)

    def test_delete_and_create(self):
        # Empty payload will delete all ordering.
        payload = []
        response = self.client.post(
            f"/phase-flow-order?uic={self.unit.uic}", data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "message": "Phase order created."})

        # Verify the new order was updated
        response = self.client.get(f"/phase-flow-order?uic={self.unit.uic}")
        self.assertEqual(response.status_code, 200)
        expected = []
        self.assertEqual(response.data, expected)

        payload = [
            {"serial": "TEST000FFAIRCRAFT0", "phase_order": 0},
            {"serial": "TEST000AAAIRCRAFT1", "phase_order": 1},
            {"serial": "TEST000A0AIRCRAFT2", "phase_order": 2},
            {"serial": "TEST000B0AIRCRAFT3", "phase_order": 3},
            {"serial": "TEST000C0AIRCRAFT4", "phase_order": 4},
            {"serial": "TEST001AAAIRCRAFT5", "phase_order": 5},
            {"serial": "TEST001A0AIRCRAFT6", "phase_order": 6},
            {"serial": "TEST001B0AIRCRAFT7", "phase_order": 7},
            {"serial": "TEST001C0AIRCRAFT8", "phase_order": 8},
            {"serial": "TEST002AAAIRCRAFT9", "phase_order": 9},
            {"serial": "TEST002A0AIRCRAFT10", "phase_order": 10},
            {"serial": "TEST002B0AIRCRAFT11", "phase_order": 11},
            {"serial": "TEST002C0AIRCRAFT12", "phase_order": 12},
        ]
        response = self.client.post(
            f"/phase-flow-order?uic={self.unit.uic}", data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "message": "Phase order created."})

        response = self.client.get(f"/phase-flow-order?uic={self.unit.uic}")
        self.assertEqual(response.status_code, 200)
        expected = [
            {"uic": "TEST000FF", "serial": "TEST000FFAIRCRAFT0", "phase_order": 0},
            {"uic": "TEST000FF", "serial": "TEST000AAAIRCRAFT1", "phase_order": 1},
            {"uic": "TEST000FF", "serial": "TEST000A0AIRCRAFT2", "phase_order": 2},
            {"uic": "TEST000FF", "serial": "TEST000B0AIRCRAFT3", "phase_order": 3},
            {"uic": "TEST000FF", "serial": "TEST000C0AIRCRAFT4", "phase_order": 4},
            {"uic": "TEST000FF", "serial": "TEST001AAAIRCRAFT5", "phase_order": 5},
            {"uic": "TEST000FF", "serial": "TEST001A0AIRCRAFT6", "phase_order": 6},
            {"uic": "TEST000FF", "serial": "TEST001B0AIRCRAFT7", "phase_order": 7},
            {"uic": "TEST000FF", "serial": "TEST001C0AIRCRAFT8", "phase_order": 8},
            {"uic": "TEST000FF", "serial": "TEST002AAAIRCRAFT9", "phase_order": 9},
            {"uic": "TEST000FF", "serial": "TEST002A0AIRCRAFT10", "phase_order": 10},
            {"uic": "TEST000FF", "serial": "TEST002B0AIRCRAFT11", "phase_order": 11},
            {"uic": "TEST000FF", "serial": "TEST002C0AIRCRAFT12", "phase_order": 12},
        ]
        self.assertEqual(response.data, expected)
