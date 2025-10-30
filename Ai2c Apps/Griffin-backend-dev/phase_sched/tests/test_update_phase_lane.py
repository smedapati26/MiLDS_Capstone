from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import UserRole
from phase_sched.models import PhaseLane, PlannedPhase
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_LANE_ALREADY_EXISTS,
    HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST,
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


@tag("phase_sched", "edit_lane")
class UpdateLaneTests(TestCase):
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
    def test_update_with_no_user_id_in_header(self):
        """
        Checks that the post request has the user within the header
        """
        url = reverse("edit_lane")
        response = self.client.post(url, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_update_with_invalid_user_id(self):
        """
        Checks that the userid passed is a valid user id
        """
        UserRole.objects.get(user_id=self.user, unit=self.test_unit)
        url = reverse("edit_lane")
        response = self.client.post(
            url,
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_without_access_level(self):
        """
        Checks that a user without the proper access cannot make an edit
        to the lane.
        """
        create_single_test_lane
        self.user_role.access_level = UserRoleAccessLevel.READ
        self.user_role.save()

        url = reverse("edit_lane")

        data = {"lane_id": self.test_lane.id, "uic": self.test_unit.uic, "name": "NEW_TEST_LANE"}

        static_lane = PhaseLane.objects.get(id=self.test_lane.id)
        static_phase = PlannedPhase.objects.get(id=self.test_phase.id)

        response = self.client.post(
            url,
            data,
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.FORBIDDEN)
        self.assertEqual(response.content.decode("utf-8"), HTTP_PERMISSION_ERROR)
        self.assertEqual(self.test_lane, static_lane)
        self.assertEqual(self.test_phase, static_phase)

    @tag("validation")
    def test_edit_with_lane_does_not_exist(self):
        """
        Checks that a user cannot proceed with a lane edit if the lane does not exist
        Receives payload:
        {"lane_id": int,
        "name": str
        }
        """

        url = reverse("edit_lane")

        data = {"lane_id": 12596 + self.test_lane.id, "uic": self.test_unit.uic, "name": "TEST_NEW_LANE"}

        response = self.client.post(
            url,
            data,
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_with_unique_constraint_name(self):
        """
        Checks that a user cannot edit a lane that violates the unique constraint of the lane name and uic combination
        Receives payload:
        {"lane_id": int,
        "name": str
        }
        """
        unique_lane = create_single_test_lane(id=4, unit=self.test_unit, name="Existing Lane")

        url = reverse("edit_lane")

        data = {"lane_id": self.test_lane.id, "uic": self.test_unit.uic, "name": "Existing Lane"}

        static_lane = PhaseLane.objects.get(id=self.test_lane.id)
        static_phase = PlannedPhase.objects.get(id=self.test_phase.id)

        response = self.client.post(
            url,
            data,
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LANE_ALREADY_EXISTS)
        self.assertEqual(self.test_lane, static_lane)
        self.assertEqual(self.test_phase, static_phase)

    @tag("validation")
    def test_edit_with_unique_constraint_lane_unit(self):
        """
        Checks that a user cannot edit a lane that violates the unique constraint of the lane name and uic combination
        Receives payload:
        {"lane_id": int,
        "name": str
        }
        """

        # Create a new unit with unique UIC
        unique_unit = create_single_test_unit(uic="TEST_UIC")
        # Create a new lane with the same name as the test lane but with the uic from the unique lane
        unique_lane_with_equal_name = create_single_test_lane(id=4, unit=unique_unit, name=self.test_lane.name)

        url = reverse("edit_lane")

        data = {"lane_id": self.test_lane.id, "uic": unique_unit.uic, "name": self.test_lane.name}

        static_lane = PhaseLane.objects.get(id=self.test_lane.id)
        static_phase = PlannedPhase.objects.get(id=self.test_phase.id)

        response = self.client.post(
            url,
            data,
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LANE_ALREADY_EXISTS)
        self.assertEqual(self.test_lane, static_lane)
        self.assertEqual(self.test_phase, static_phase)

    @tag("validation")
    def test_edit_phase_via_http_post(self):
        """
        Checks that the intended phase lane name is being edited correctly and that the updated information is being stored.
        Receives payload:
        {"lane_id": str,
        "name": str
        }
        """

        new_unit = create_single_test_unit(uic="TEST_UIC")

        url = reverse("edit_lane")
        edited_phase = PlannedPhase.objects.get(id=self.test_phase.id)

        data = {"lane_id": self.test_lane.id, "uic": new_unit.uic, "name": "NEW_TEST_LANE"}
        response = self.client.post(
            url,
            data,
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type=self.json_content,
        )

        self.test_lane.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Lane Updated Successfully")
        self.assertEqual(self.test_phase.lane, edited_phase.lane)
        self.assertEqual(self.test_lane.name, "NEW_TEST_LANE")
