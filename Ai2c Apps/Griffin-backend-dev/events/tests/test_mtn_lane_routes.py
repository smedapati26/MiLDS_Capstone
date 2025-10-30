import json

from django.test import TestCase, tag
from ninja.testing import TestClient

from events.api.routes import events_router
from utils.tests import create_single_test_maintenance_lane, create_test_units, create_test_user


@tag("events")
class MaintenanceLaneTest(TestCase):
    def setUp(self):
        # create unit to house test aircraft
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])
        self.admin_user = create_test_user(unit=self.units_created[0], user_id="0000000001", is_admin=True)
        # Create Maintenance Lane for Unit
        self.lane = create_single_test_maintenance_lane(unit=self.units_created[0])
        # Create Lane to test delete
        self.delete_lane = create_single_test_maintenance_lane(unit=self.units_created[0], name="Delete Lane")

        self.client = TestClient(events_router, headers={"Auth-User": self.user.user_id})
        self.admin_client = TestClient(events_router, headers={"Auth-User": self.admin_user.user_id})
        self.unauthorized_client = TestClient(events_router, headers={"Auth-User": "FAKE_USER"})

    def test_list_maintenance_lanes_valid(self):
        response = self.client.get(f"/maintenance-lanes?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        # Should return 1 Maintenance Lane
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["items"][0]["name"], "TEST LANE")

    def test_list_maintenance_lanes_invalid_unit(self):
        response = self.client.get("/maintenance-lanes?uic=FAKEUNIT")
        self.assertEqual(response.status_code, 404)

    def test_list_maintenance_lanes_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/maintenance-lanes?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 401)

    def test_create_maintenance_lane_valid(self):
        mtn_ln_dict = {
            "unit_id": self.units_created[0].uic,
            "airframes": [],
            "name": "Test Created Lane",
            "contractor": False,
            "internal": False,
        }
        response = self.admin_client.post(
            f"/maintenance-lane", data=json.dumps(mtn_ln_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        # Should return 1 Maintenance Lane
        self.assertEqual(type(response.data["id"]), int)

    def test_create_maintenance_lane_invalid_content(self):
        mtn_ln_dict = {
            "unit_id": self.units_created[0].uic,
            "airframes": [],
            "name": "Test Created Lane",
            "contractor": 14,  # incorrect type
            "internal": False,
        }
        response = self.admin_client.post(
            f"/maintenance-lane", data=json.dumps(mtn_ln_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 422)

    def test_create_maintenance_lane_unauthorized_user(self):
        mtn_ln_dict = {
            "unit_id": self.units_created[0].uic,
            "airframes": [],
            "name": "Test Created Lane",
            "contractor": False,
            "internal": False,
        }
        response = self.unauthorized_client.post(
            f"/maintenance-lane", data=json.dumps(mtn_ln_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)

    def test_create_maintenance_lane_no_permissions_user(self):
        mtn_ln_dict = {
            "unit_id": self.units_created[0].uic,
            "airframes": [],
            "name": "Test Created Lane",
            "contractor": False,
            "internal": False,
        }
        response = self.client.post(f"/maintenance-lane", data=json.dumps(mtn_ln_dict), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)

    def test_read_maintenance_lane_valid(self):
        response = self.client.get(f"/maintenance-lane/{self.lane.id}")
        self.assertEqual(response.status_code, 200)
        # Should return 1 Maintenance Lane
        self.assertEqual(response.data["name"], "TEST LANE")

    def test_read_maintenance_lanes_invalid_lane(self):
        response = self.client.get("/maintenance-lane/200")
        self.assertEqual(response.status_code, 404)

    def test_read_maintenance_lane_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/maintenance-lane/{self.lane.id}")
        self.assertEqual(response.status_code, 401)

    def test_update_maintenance_lane_valid(self):
        mtn_ln_dict = {"name": "Test Updated Lane"}
        response = self.admin_client.put(
            f"/maintenance-lane/{self.lane.id}", data=json.dumps(mtn_ln_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)

    def test_update_maintenance_lane_invalid_content(self):
        mtn_ln_dict = {"contractor": 14}  # incorrect type
        response = self.admin_client.put(
            f"/maintenance-lane/{self.lane.id}", data=json.dumps(mtn_ln_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 422)

    def test_update_maintenance_lane_invalid_lane(self):
        mtn_ln_dict = {"name": "Test Updated Lane"}
        response = self.admin_client.put(
            f"/maintenance-lane/100", data=json.dumps(mtn_ln_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)

    def test_update_maintenance_lane_unauthorized_user(self):
        mtn_ln_dict = {"name": "Test Updated Lane"}
        response = self.unauthorized_client.put(
            f"/maintenance-lane/{self.lane.id}", data=json.dumps(mtn_ln_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)

    def test_update_maintenance_lane_no_permissions_user(self):
        mtn_ln_dict = {"name": "Test Updated Lane"}
        response = self.client.put(
            f"/maintenance-lane/{self.lane.id}", data=json.dumps(mtn_ln_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)

    def test_delete_maintenance_lane_valid(self):
        response = self.admin_client.delete(f"/maintenance-lane/{self.delete_lane.id}")
        self.assertEqual(response.status_code, 200)
        # Should return 1 Maintenance Lane
        self.assertEqual(response.data["success"], True)

    def test_delete_maintenance_lanes_invalid_lane(self):
        response = self.client.delete("/maintenance-lane/200")
        self.assertEqual(response.status_code, 404)

    def test_delete_maintenance_lane_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/maintenance-lane/{self.lane.id}")
        self.assertEqual(response.status_code, 401)

    def test_delete_maintenance_lane_no_permissions_user(self):
        response = self.client.delete(f"/maintenance-lane/{self.lane.id}")
        self.assertEqual(response.status_code, 200)
        # Should return 1 Maintenance Lane
        self.assertEqual(response.data["success"], False)
