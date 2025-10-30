from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import UserRole
from phase_sched.models import PlannedPhase
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_PERMISSION_ERROR,
)
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_lane,
    create_single_test_planned_phase,
    create_single_test_unit,
    create_test_user,
    create_user_role_in_all,
)


@tag("phase_sched", "delete_phase")
class DeletePhaseTests(TestCase):
    json_content = "application/json"

    # InitiaL setup for the Edit Phase EndPOINT fUNCTIONALITY
    # - Creating the needed models
    def setUp(self) -> None:
        # Create Unit
        self.test_unit = create_single_test_unit(echelon="CO")
        # Create Aircraft
        self.test_aircraft = create_single_test_aircraft(current_unit=self.test_unit)
        # Create Lane
        self.test_lane = create_single_test_lane(unit=self.test_unit)
        # Create Phase
        self.test_phase = create_single_test_planned_phase(lane=self.test_lane, aircraft=self.test_aircraft)
        # Create Users
        self.user = create_test_user(unit=self.test_unit)
        self.admin = create_test_user(unit=self.test_unit, user_id="0000000001", is_admin=True)
        # Create Access Roles
        create_user_role_in_all(self.user, [self.test_unit], UserRoleAccessLevel.ADMIN)

    @tag("validation")
    def test_delete_with_no_user_id_in_header(self):
        """
        Checks that the post reqeust has the user within the header
        """
        url = reverse("delete_phase")
        response = self.client.delete(url, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_delete_with_invalid_user_id(self):
        """
        Checks that the userid passed is a valid user id
        """
        url = reverse("delete_phase")
        response = self.client.delete(
            url,
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    @tag("validation")
    def test_delete_without_access_level(self):
        """
        Checks that a user without the proper access cannot delete a phase.
        """
        # Alter role to read status
        delete_user_role = UserRole.objects.get(user_id=self.user, unit=self.test_unit)
        delete_user_role.access_level = UserRoleAccessLevel.READ
        delete_user_role.save()

        url = reverse("delete_phase")
        data = {"phase_id": self.test_phase.id}

        response = self.client.delete(
            url, headers={"X-On-Behalf-Of": self.user.user_id}, content_type=self.json_content
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_PERMISSION_ERROR)
        self.assertTrue(PlannedPhase.objects.filter(id=data["phase_id"]).exists())

    @tag("validation")
    def test_delete_phase_via_http_post(self):
        """
        Checks that the indented phase is delete correctly
        Requires a json body of the following parameters:
        {"phase_id: (int) the databsae id of the phase
        "user_id: (str) the database id of the user making the delete}
        """
        url = reverse("delete_phase")
        data = {
            "phase_id": self.test_phase.id,
        }

        response = self.client.delete(
            url,
            data,
            headers={"X-On-Behalf-Of": self.admin.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Phase Deleted Successfully")
        self.assertFalse(PlannedPhase.objects.filter(id=data["phase_id"]).exists())
