import json
from datetime import date, timedelta
from http import HTTPStatus

from django.test import TestCase
from ninja.testing import TestClient

from agse.api.routes import agse_router
from agse.model_utils.agse_edits_lock_type import AgseEditsLockType
from agse.models import AGSE, UnitAGSE
from auto_dsr.models import Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import (  # create_test_taskforce,
    create_single_test_agse,
    create_single_test_unit,
    create_test_units,
    create_test_user,
    get_default_bottom_unit,
    get_default_middle_unit,
    get_default_top_unit,
)

client = TestClient(agse_router)


class AGSETests(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.task_force_unit = create_single_test_unit(uic="TFUNFF")

        self.admin_user = create_test_user(unit=self.top_unit, is_admin=True)
        self.read_user = create_test_user(unit=self.top_unit, is_admin=False, user_id="123456789")

        self.client = TestClient(agse_router, headers={"Auth-User": self.admin_user.user_id})
        self.read_client = TestClient(agse_router, headers={"Auth-User": self.read_user.user_id})

        self.user = create_test_user(user_id="123", unit=self.top_unit)

        self.middle_unit = get_default_middle_unit()
        self.middle_agse = create_single_test_agse(current_unit=self.middle_unit, equipment_number="MIDDLEMAGSE")

        self.agse = create_single_test_agse(current_unit=self.bottom_unit)

        self.top_agse = create_single_test_agse(current_unit=self.top_unit, equipment_number="TOPAGSE")

        self.bottom_agse = create_single_test_agse(current_unit=self.bottom_unit, equipment_number="BTTMAGSE")

        self.unit_agse = []

        bottom_unit_hierarchy = [self.bottom_unit.uic] + self.bottom_unit.parent_uics

        self.mock_update_data = {
            "status": "NMCS",
            "earliest_nmc_start": (date.today() + timedelta(days=1)).isoformat(),
            "remarks": "Test remark about broken equipment",
            "lock_type": AgseEditsLockType.UGSRE,
        }

        for unit in Unit.objects.filter(uic__in=bottom_unit_hierarchy):
            self.unit_agse.append(UnitAGSE.objects.create(unit=unit, agse=self.agse))
            self.unit_agse.append(UnitAGSE.objects.create(unit=unit, agse=self.bottom_agse))

        self.top_unit_agse = UnitAGSE.objects.create(unit=self.top_unit, agse=self.top_agse)
        self.middle_unit_agse = UnitAGSE.objects.create(unit=self.top_unit, agse=self.middle_agse)
        self.unit_agse.append(self.top_unit_agse)

    def test_get_agse_invalid_uic(self):
        """Test retrieval with an invalid UIC."""
        invalid_uic = "INVALID" + self.top_unit.uic
        response = self.client.get(f"/agse?uic={invalid_uic}")

        response_json = json.loads(response.content.decode("utf-8"))
        self.assertEqual(response_json.get("detail"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertTrue(response.headers["Content-Type"].startswith("application/json"))
        self.assertIn(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST, response.content.decode("utf-8"))

    def test_get_agse_from_taskforce_at_bottom_of_hierarchy(self):
        expected_agses = [
            self.bottom_agse.equipment_number,
            self.agse.equipment_number,
            self.top_agse.equipment_number,
            self.middle_agse.equipment_number,
        ]

        agse_values = [
            "equipment_number",
            "lin",
            "serial_number",
            "condition",
            "current_unit",
            "nomenclature",
            "display_name",
            "earliest_nmc_start",
            "model",
            "days_nmc",
            "remarks",
        ]

        agse = AGSE.objects.filter(equipment_number__in=expected_agses)
        agse_data = list(agse.values(*agse_values))

        sync_fields = ["condition", "earliest_nmc_start", "remarks"]
        syncs = [
            {
                "equipment_number": agse_item.equipment_number,
                **{f"sync_{field}": agse_item.should_sync_field(field) for field in sync_fields},
            }
            for agse_item in agse
        ]

        expected_return_value = {"agse": agse_data, "syncs": syncs}
        response = self.client.get(f"/agse?uic={self.top_unit.uic}")

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(response.json()["agse"], expected_return_value["agse"])

    def test_get_agse_subordinate(self):
        expected = [
            {
                "agse": [
                    {
                        "condition": "FMC",
                        "current_unit": "TEST000AA",
                        "days_nmc": None,
                        "display_name": "TEST DISPLAY NAME",
                        "earliest_nmc_start": None,
                        "equipment_number": "MIDDLEMAGSE",
                        "lin": "TESTLIN",
                        "model": None,
                        "nomenclature": "TEST NOMENCLATURE",
                        "remarks": None,
                        "serial_number": "1234567890",
                    }
                ],
                "subordinate": "1st Battalion, 100th Test Aviation Regiment",
                "display_name": "TEST DISPLAY NAME",
            },
            # {"agse": [], "subordinate": "2nd Battalion, 100th Test Aviation Regiment", "display_name": ""},
            # {"agse": [], "subordinate": "3rd Battalion, 100th Test Aviation Regiment", "display_name": ""},
        ]

        response = self.client.get(f"/agse-subordinate?uic={self.top_unit.uic}")

        self.assertEqual(response.json(), expected)

    def test_get_condition_aggregate(self):
        response = self.client.get(f"/aggregate-condition?uic={self.top_unit.uic}")
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.json(), [{"display_name": "TEST DISPLAY NAME", "fmc": 1, "nmc": 0, "pmc": 0}])

    def test_get_condition_aggregate_invalid_uic(self):
        invalid_uic = "INVALID" + self.top_unit.uic
        response = self.client.get(f"/aggregate-condition?uic={invalid_uic}")

        response_json = json.loads(response.content.decode("utf-8"))
        self.assertEqual(response_json.get("detail"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertTrue(response.headers["Content-Type"].startswith("application/json"))
        self.assertIn(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST, response.content.decode("utf-8"))

    def test_remove_agse_from_taskforce(self):
        agse_equipment_number = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        initial_agse_count = UnitAGSE.objects.count()
        initial_task_force_agse_count = UnitAGSE.objects.filter(unit__uic=test_task_force).count()
        response = self.client.delete(
            "/agse-taskforce", json={"task_force": test_task_force, "agse_equipment_numbers": [agse_equipment_number]}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["detail"], "AGSE successfully removed from Task Force")

        updated_agse_count = UnitAGSE.objects.count()
        updated_task_force_agse_count = UnitAGSE.objects.filter(unit__uic=test_task_force).count()

        self.assertEqual(
            updated_agse_count, initial_agse_count - 3, "AGSE count did not decrease by the expected amount"
        )
        self.assertEqual(
            updated_task_force_agse_count,
            initial_task_force_agse_count - 1,
            "AGSE count within the Task Force did not decrease by the expected amount",
        )

        self.assertFalse(
            UnitAGSE.objects.filter(agse__equipment_number=agse_equipment_number).exists(),
            "Deleted AGSE instance still exists in the database",
        )

    def test_remove_agse_from_taskforce_with_invalid_task_force_uic(self):
        agse_equipment_numbers = self.agse.equipment_number
        test_task_force = "NOT" + self.top_unit.uic

        response = self.client.delete(
            "/agse-taskforce", json={"task_force": test_task_force, "agse_equipment_numbers": [agse_equipment_numbers]}
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.json()["detail"], "Unit does not exist")

    def test_remove_agse_from_taskforce_with_invalid_user(self):
        agse_equipment_numbers = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.read_client.delete(
            "/agse-taskforce", json={"task_force": test_task_force, "agse_equipment_numbers": [agse_equipment_numbers]}
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["detail"], f"Permission Denied to update {test_task_force}")

    def test_add_agse_to_task_force(self):
        agse_equipment_numbers = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.post(
            "/agse-taskforce", json={"task_force": test_task_force, "agse_equipment_numbers": [agse_equipment_numbers]}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["detail"], "AGSE(s) added to Task Force")
        self.assertEqual(response.json()["equipment_added"], ["TESTAGSE"])

    def test_add_agse_to_task_force_invalid_user(self):
        agse_equipment_numbers = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.read_client.post(
            "/agse-taskforce", json={"task_force": test_task_force, "agse_equipment_numbers": [agse_equipment_numbers]}
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["detail"], f"Permission Denied to add to {test_task_force}")

    def test_add_agse_to_task_force_with_invalid_task_force_uic(self):
        agse_equipment_numbers = self.agse.equipment_number
        test_task_force = "NOT" + self.top_unit.uic

        response = self.client.post(
            "/agse-taskforce", json={"task_force": test_task_force, "agse_equipment_numbers": [agse_equipment_numbers]}
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.json()["detail"], "Unit does not exist")

    def test_add_agse_to_task_force_with_invalid_agse_serial(self):
        agse_equipment_numbers = "NOT" + self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.post(
            "/agse-taskforce", json={"task_force": test_task_force, "agse_equipment_numbers": [agse_equipment_numbers]}
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.json()["detail"], "No equipment added.")

    def test_update_agse(self):
        equipment_number = self.agse.equipment_number
        test_task_force = self.top_unit.uic
        response = self.client.patch(
            f"/agse/{equipment_number}",
            json={
                "task_force": test_task_force,
                "status": "NMC",
                "earliest_nmc_start": "2025-05-12",
                "remarks": "Updated maintenance notes",
                "lock_type": "physical",
                "sync_condition": True,
                "sync_earliest_nmc_start": False,
                "sync_remarks": True,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["detail"], "AGSE Successfully Edited")

    def test_update_agse_does_not_exist(self):
        equipment_number = "NOT" + self.agse.equipment_number
        test_task_force = self.top_unit.uic
        response = self.client.patch(
            f"/agse/{equipment_number}",
            json={
                "task_force": test_task_force,
                "status": "NMC",
                "earliest_nmc_start": "2025-05-12",
                "remarks": "Updated maintenance notes",
                "lock_type": "physical",
                "sync_condition": True,
                "sync_earliest_nmc_start": False,
                "sync_remarks": True,
            },
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "AGSE does not exist")
