from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from phase_sched.models import PhaseLane, PlannedPhase
from auto_dsr.models import UserRole
from auto_dsr.model_utils import UserRoleAccessLevel

from utils.tests import (
    create_single_test_unit,
    create_single_test_aircraft,
    create_single_test_lane,
    create_single_test_planned_phase,
    create_test_user,
    create_user_role_in_all,
)

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_PERMISSION_ERROR,
    HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST,
)


@tag("phase_sched", "delete_lane")
class DeleteLaneTests(TestCase):
    json_content = "application/json"

    # Initial setup for the Edit Lane endpoint functionality
    # - Creating the needed models
    def setUp(self):
        # Create Unit
        self.test_unit = create_single_test_unit()
        # Create Aircraft
        self.test_aircraft = create_single_test_aircraft(current_unit=self.test_unit)
        # Create Lane
        self.test_lane = create_single_test_lane(unit=self.test_unit)
        # Create Phase
        self.test_phase = create_single_test_planned_phase(lane=self.test_lane, aircraft=self.test_aircraft)
        # Create Users
        self.user = create_test_user(unit=self.test_unit)
        # Create Access Roles
        create_user_role_in_all(self.user, [self.test_unit], UserRoleAccessLevel.ADMIN)
        # Get user Role
        self.user_role = UserRole.objects.get(user_id=self.user, unit=self.test_unit)

    @tag("validation")
    def test_delete_with_no_user_id_in_header(self):
        """
        Checks that the delete request has the user id within the header
        """
        url = reverse("delete_lane")
        response = self.client.delete(url, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_delete_with_invalid_user_id(self):
        """
        Checks that the userid passed is a valid user id
        """

        UserRole.objects.get(user_id=self.user, unit=self.test_unit)
        url = reverse("delete_lane")
        response = self.client.delete(
            url,
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
            content_type=self.json_content,
        )
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)

    @tag("validation")
    def test_delete_without_access_level(self):
        """
        Checks that a user without the proper access cannot make an edit
        to the lane.
        """
        self.user_role.access_level = UserRoleAccessLevel.READ
        self.user_role.save()

        url = reverse("delete_lane")

        data = {"lane_id": self.test_lane.id, "phase_name": "NEW_TEST_LANE"}

        static_lane = PhaseLane.objects.get(id=self.test_lane.id)
        static_phase = PlannedPhase.objects.get(id=self.test_phase.id)

        response = self.client.delete(
            url,
            data,
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.FORBIDDEN)
        self.assertEqual(response.content.decode("utf-8"), HTTP_PERMISSION_ERROR)
        self.assertTrue(PhaseLane.objects.filter(id=data["lane_id"]).exists())

    @tag("validation")
    def test_edit_with_lane_does_not_exist(self):
        """
        Checks that a user cannot proceed with a lane edit if the lane does not exist
        Receives payload:
        {"lane_id": str,
        }
        """

        url = reverse("delete_lane")

        data = {"lane_id": 12596 + self.test_lane.id}

        response = self.client.delete(
            url,
            data,
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_phase_via_http_delete(self):
        """
        Checks that the intended phase lane name is being edited correctly and that the updated information is being stored.
        Receives payload:
        {"lane_id": str,
        "lane_name": str
        }
        """

        url = reverse("delete_lane")

        data = {
            "lane_id": self.test_lane.id,
        }

        response = self.client.delete(
            url,
            data,
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Lane Deleted Successfully")
        self.assertFalse(PhaseLane.objects.filter(id=data["lane_id"]).exists())
