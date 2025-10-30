import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from agse.model_utils import AgseStatus
from agse.models import AGSE, UnitAGSE
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)
from utils.tests import (
    create_single_test_agse,
    create_test_units,
    create_test_user,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("agse", "remove_agse_from_taskforce")
class RemoveAGSEFromTaskForceViewTests(TestCase):
    # Initial setup for Remove AGSE from Task Force endpoint functionality.
    # - creating the needed models
    def setUp(self):
        self.units, self.units_hierarchy = create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.agse = create_single_test_agse(current_unit=self.bottom_unit)

        self.user = create_test_user(self.top_unit)

        self.unit_agse = []

        for unit in self.units:
            self.unit_agse.append(UnitAGSE.objects.create(unit=unit, agse=self.agse))

    # Tests for removing Aircraft from Task Force endpoint.
    def test_remove_agse_from_taskforce_with_no_user_id_in_header(self):
        test_agse = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "remove_agse_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse,
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_remove_agse_from_taskforce_with_incorrect_user_id(self):
        test_agse = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "remove_agse_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_remove_agse_from_taskforce_with_non_post_request(self):
        test_agse = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.get(
            reverse(
                "remove_agse_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST)

    def test_remove_agse_from_taskforce_with_invalid_task_force_uic(self):
        test_agse = self.agse.equipment_number
        test_task_force = "NOT" + self.top_unit.uic

        response = self.client.post(
            reverse(
                "remove_agse_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
        )

    def test_remove_agse_from_taskforce_with_no_parent_uics(self):
        test_agse = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "remove_agse_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "AGSE successfully removed from task force.",
        )

        self.assertEqual(UnitAGSE.objects.count(), 0)  # All subordinate units should have the agse removed, too

    def test_remove_agse_from_taskforce_with_many_parent_uics(self):
        test_agse = self.agse.equipment_number
        test_task_force = self.bottom_unit.uic
        starting_unit_agse_count = UnitAGSE.objects.count()

        response = self.client.post(
            reverse(
                "remove_agse_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "AGSE successfully removed from task force.",
        )

        self.assertEqual(
            UnitAGSE.objects.count(), starting_unit_agse_count - 1
        )  # Only the one Unit AGSE should be removed as this Unit has no children units.

    def test_remove_multiple_agse_from_taskforce_with_many_parent_uics(self):
        test_agse = self.agse.equipment_number
        test_task_force = self.bottom_unit.uic

        additional_agse = AGSE.objects.create(
            equipment_number="TESTAGSE2",
            lin="TestLineNum2",
            serial_number="Test Serial Number 2",
            condition=AgseStatus.FMC,
            nomenclature="Test Nomenclature",
            display_name="Test Display Name 2",
            current_unit=self.bottom_unit,
        )

        for unit in self.units:
            new_unit_agse = UnitAGSE.objects.create(unit=unit, agse=additional_agse)
            new_unit_agse.save()

        # Ensure new Unit AGSE are created.
        self.assertEqual(UnitAGSE.objects.count(), len(self.units) * 2)
        starting_unit_agse_count = UnitAGSE.objects.count()

        response = self.client.post(
            reverse(
                "remove_agse_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": [test_agse, additional_agse.equipment_number],
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "AGSE successfully removed from task force.",
        )

        self.assertEqual(
            UnitAGSE.objects.count(), starting_unit_agse_count - 2
        )  # Only the two Unit AGSE should be removed as this Unit has no children Units.

    def test_remove_agse_from_taskforce_with_no_pre_established_hiearchy(self):
        # Removing all Unit AGSE in the hiearchy except for the passed unit to simulate
        # legacy Unit AGSE data and still ensure a pass.
        UnitAGSE.objects.filter(agse=self.agse).exclude(unit=self.bottom_unit).delete()

        # Ensure only one Unit Aircraft object currently exists.
        self.assertEqual(UnitAGSE.objects.count(), 1)

        # Validate that a Unit in a Task Force hiearchy with no parents containing the
        # requested AGSE to be removed still passes.
        test_agse = self.agse.equipment_number
        test_task_force = self.bottom_unit.uic

        response = self.client.post(
            reverse(
                "remove_agse_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "AGSE successfully removed from task force.",
        )

        self.assertEqual(
            UnitAGSE.objects.count(), 0
        )  # Since there was only one Unit Aircraft in this hiearchy to be removed, there should be none existing now.

    def test_remove_agse_from_taskforce_after_using_add_agse_to_taskforce_endpoint(
        self,
    ):
        # Clear current Unit AGSE table to ensure new creation from add endpoint.
        UnitAGSE.objects.all().delete()

        # Setting of test data.
        test_agse = self.agse.equipment_number
        test_task_force = self.bottom_unit.uic

        # Adding unit aicraft up the hiearchy.
        response = self.client.post(
            reverse(
                "add_agse_to_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "AGSE added to Task Force.",
        )

        self.assertEqual(
            UnitAGSE.objects.count(), len(self.bottom_unit.parent_uics) + 1
        )  # Each unit should add its unit agse as this tf is a child to each unit in this hiearchy.

        starting_unit_agse_count = UnitAGSE.objects.count()

        # Now testing the remove endpoint.
        response = self.client.post(
            reverse(
                "remove_agse_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "AGSE successfully removed from task force.",
        )

        self.assertEqual(
            UnitAGSE.objects.count(), starting_unit_agse_count - 1
        )  # Only 1 Unit AGSE should be removed as this Unit has no children Units.
