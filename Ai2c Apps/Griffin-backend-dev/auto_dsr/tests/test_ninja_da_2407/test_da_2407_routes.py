import json
from datetime import datetime, timedelta

from django.test import TestCase, tag
from ninja.testing import TestClient

from aircraft.models import DA_2407
from auto_dsr.api.routes import auto_dsr_router
from utils.tests import create_single_test_da_2407, create_test_units, create_test_user


@tag("DA2407s")
class DA2407Test(TestCase):
    def setUp(self):
        # create unit to house test aircraft
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.begin_date = datetime.date(datetime.now().astimezone()) - timedelta(days=1)
        self.end_date = datetime.date(datetime.now().astimezone()) + timedelta(days=1)
        self.series_end_date = datetime.date(datetime.now().astimezone()) + timedelta(days=366)

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])
        self.admin_user = create_test_user(unit=self.units_created[0], user_id="0000000001", is_admin=True)
        # Create Work Orders events including one to delete
        self.da_2407 = create_single_test_da_2407(self.units_created[0], self.units_created[0])
        self.delete_event = create_single_test_da_2407(self.units_created[0], self.units_created[0])

        self.client = TestClient(auto_dsr_router, headers={"Auth-User": self.user.user_id})
        self.admin_client = TestClient(auto_dsr_router, headers={"Auth-User": self.admin_user.user_id})
        self.unauthorized_client = TestClient(auto_dsr_router, headers={"Auth-User": "FAKE_USER"})

    def test_list_da_2407_valid(self):
        response = self.client.get(f"/da-2407s?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["uic_work_order_number"], "123")

    def test_list_da_2407_invalid_unit(self):
        response = self.client.get(f"/da-2407s?uic=FAKEUNIT")
        self.assertEqual(response.status_code, 404)

    def test_list_da_2407_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/da-2407s?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 401)

    def test_create_da_2407_valid(self):
        da_2407_dict = {
            "uic_work_order_number": "1234",
            "work_order_number": "4567",
            "customer_unit_id": self.units_created[0].uic,
            "support_unit_id": self.units_created[0].uic,
            "shop": "string",
            "remarks": "string",
            "malfunction_desc": "string",
            "deficiency": "string",
            "submitted_datetime": "2025-02-24T21:57:46",
            "accepted_datetime": "2025-02-24T21:57:46",
            "work_start_datetime": "2025-02-24T21:57:46",
            "when_discovered": "string",
            "how_discovered": "string",
        }
        response = self.admin_client.post(
            f"/da-2407s", data=json.dumps(da_2407_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(type(response.data["id"]), int)

    def test_create_da_2407_invalid_content(self):
        da_2407_dict = {
            "uic_work_order_number": "1234",
            "work_order_number": "4567",
            "customer_unit_id": self.units_created[0].uic,
            "support_unit_id": self.units_created[0].uic,
            "shop": 10,  # INVALID TYPE
            "remarks": "string",
            "malfunction_desc": "string",
            "deficiency": "string",
            "submitted_datetime": "2025-02-24T21:57:46",
            "accepted_datetime": "2025-02-24T21:57:46",
            "work_start_datetime": "2025-02-24T21:57:46",
            "when_discovered": "string",
            "how_discovered": "string",
        }
        response = self.admin_client.post(
            f"/da-2407s", data=json.dumps(da_2407_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 422)

    def test_create_da_2407_unauthorized_user(self):
        da_2407_dict = {
            "uic_work_order_number": "1234",
            "work_order_number": "4567",
            "customer_unit_id": self.units_created[0].uic,
            "support_unit_id": self.units_created[0].uic,
            "shop": "string",
            "remarks": "string",
            "malfunction_desc": "string",
            "deficiency": "string",
            "submitted_datetime": "2025-02-24T21:57:46",
            "accepted_datetime": "2025-02-24T21:57:46",
            "work_start_datetime": "2025-02-24T21:57:46",
            "when_discovered": "string",
            "how_discovered": "string",
        }
        response = self.unauthorized_client.post(
            f"/da-2407s", data=json.dumps(da_2407_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)

    def test_create_da_2407_no_permissions_user(self):
        da_2407_dict = {
            "uic_work_order_number": "1234",
            "work_order_number": "4567",
            "customer_unit_id": self.units_created[0].uic,
            "support_unit_id": self.units_created[0].uic,
            "shop": "string",
            "remarks": "string",
            "malfunction_desc": "string",
            "deficiency": "string",
            "submitted_datetime": "2025-02-24T21:57:46",
            "accepted_datetime": "2025-02-24T21:57:46",
            "work_start_datetime": "2025-02-24T21:57:46",
            "when_discovered": "string",
            "how_discovered": "string",
        }
        response = self.client.post(
            f"/da-2407s", data=json.dumps(da_2407_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)

    def test_read_da_2407_valid(self):
        response = self.client.get(f"/da-2407s/{self.da_2407.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["uic_work_order_number"], "123")

    def test_read_da_2407_invalid_event(self):
        response = self.client.get("/da-2407s/200")
        self.assertEqual(response.status_code, 404)

    def test_read_da_2407_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/da-2407s/{self.da_2407.id}")
        self.assertEqual(response.status_code, 401)

    def test_update_da_2407_valid(self):
        da_2407_dict = {
            "uic_work_order_number": "1234",
            "work_order_number": "4567",
            "customer_unit_id": self.units_created[0].uic,
            "support_unit_id": self.units_created[0].uic,
            "shop": "string",
            "remarks": "Updated Remarks",
            "malfunction_desc": "string",
            "deficiency": "string",
            "submitted_datetime": "2025-02-24T21:57:46",
            "accepted_datetime": "2025-02-24T21:57:46",
            "work_start_datetime": "2025-02-24T21:57:46",
            "when_discovered": "string",
            "how_discovered": "string",
        }
        response = self.admin_client.put(
            f"/da-2407s/{self.da_2407.id}", data=json.dumps(da_2407_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(DA_2407.objects.get(id=self.da_2407.id).remarks, "Updated Remarks")

    def test_update_da_2407_invalid_content(self):
        da_2407_dict = {
            "uic_work_order_number": "1234",
            "work_order_number": "4567",
            "customer_unit_id": self.units_created[0].uic,
            "support_unit_id": self.units_created[0].uic,
            "shop": "string",
            "remarks": 10,  # incorrect type
            "malfunction_desc": "string",
            "deficiency": "string",
            "submitted_datetime": "2025-02-24T21:57:46",
            "accepted_datetime": "2025-02-24T21:57:46",
            "work_start_datetime": "2025-02-24T21:57:46",
            "when_discovered": "string",
            "how_discovered": "string",
        }
        response = self.admin_client.put(
            f"/da-2407s/{self.da_2407.id}", data=json.dumps(da_2407_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 422)

    def test_update_da_2407_invalid_event(self):
        da_2407_dict = {
            "uic_work_order_number": "1234",
            "work_order_number": "4567",
            "customer_unit_id": self.units_created[0].uic,
            "support_unit_id": self.units_created[0].uic,
            "shop": "string",
            "remarks": "Updated Remarks",
            "malfunction_desc": "string",
            "deficiency": "string",
            "submitted_datetime": "2025-02-24T21:57:46",
            "accepted_datetime": "2025-02-24T21:57:46",
            "work_start_datetime": "2025-02-24T21:57:46",
            "when_discovered": "string",
            "how_discovered": "string",
        }
        response = self.admin_client.put(
            f"/da-2407s/100", data=json.dumps(da_2407_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)

    def test_update_da_2407_unauthorized_user(self):
        da_2407_dict = {
            "uic_work_order_number": "1234",
            "work_order_number": "4567",
            "customer_unit_id": self.units_created[0].uic,
            "support_unit_id": self.units_created[0].uic,
            "shop": "string",
            "remarks": "Updated Remarks",
            "malfunction_desc": "string",
            "deficiency": "string",
            "submitted_datetime": "2025-02-24T21:57:46",
            "accepted_datetime": "2025-02-24T21:57:46",
            "work_start_datetime": "2025-02-24T21:57:46",
            "when_discovered": "string",
            "how_discovered": "string",
        }
        response = self.unauthorized_client.put(
            f"/da-2407s/{self.da_2407.id}", data=json.dumps(da_2407_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)

    def test_update_da_2407_no_permissions_user(self):
        da_2407_dict = {
            "uic_work_order_number": "1234",
            "work_order_number": "4567",
            "customer_unit_id": self.units_created[0].uic,
            "support_unit_id": self.units_created[0].uic,
            "shop": "string",
            "remarks": "Updated Remarks",
            "malfunction_desc": "string",
            "deficiency": "string",
            "submitted_datetime": "2025-02-24T21:57:46",
            "accepted_datetime": "2025-02-24T21:57:46",
            "work_start_datetime": "2025-02-24T21:57:46",
            "when_discovered": "string",
            "how_discovered": "string",
        }
        response = self.client.put(
            f"/da-2407s/{self.da_2407.id}", data=json.dumps(da_2407_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)

    def test_delete_da_2407_valid(self):
        response = self.admin_client.delete(f"/da-2407s/{self.delete_event.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)

    def test_delete_da_2407_invalid_event(self):
        response = self.client.delete("/da-2407s/200")
        self.assertEqual(response.status_code, 404)

    def test_delete_da_2407_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/da-2407s/{self.da_2407.id}")
        self.assertEqual(response.status_code, 401)

    def test_delete_da_2407_no_permissions_user(self):
        response = self.client.delete(f"/da-2407s/{self.da_2407.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)
