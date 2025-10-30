from datetime import timedelta
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone

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


@tag("phase_sched", "edit_phase")
class EditPhaseTests(TestCase):
    json_content = "application/json"

    # Initial setup for the Edit Phase endpoint functionality
    # - Creating the needed models
    def setUp(self):
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
    def test_update_with_no_user_id_in_header(self):
        """
        Checks that the post request has the user within the header
        """
        url = reverse("edit_phase")
        response = self.client.post(url, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_update_with_invalid_user_id(self):
        """
        Checks that the userid passed is a valid user id
        """
        url = reverse("edit_phase")
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
        to the phases.
        """
        # Alter role to read status
        edit_user_role = UserRole.objects.get(user_id=self.user, unit=self.test_unit)
        edit_user_role.access_level = UserRoleAccessLevel.READ
        edit_user_role.save()

        url = reverse("edit_phase")

        new_value = timezone.now() + timedelta(days=10)

        data = {
            "phase_id": self.test_phase.id,
            "lane_id": self.test_lane.id,
            "inspection": self.test_phase.phase_type,
            "start": new_value.date(),
            "end": self.test_phase.end_date.strftime("%Y-%m-%d"),
        }

        response = self.client.post(
            url,
            data,
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type=self.json_content,
        )

        static_phase = PlannedPhase.objects.get(id=self.test_phase.id)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_PERMISSION_ERROR)
        self.assertEqual(self.test_phase, static_phase)

    @tag("validation")
    def test_edit_phase_via_http_post(self):
        """
        Checks that the intended phase is being edited correctly and that the updated information is being stored.
        Receives phase_id, col, value
        Phase id is used to grab the PlannedPhase object
        Col is used to index the changed field
        Value is used to update the field
        """
        # Mimic changing start date by 10 days in the future
        new_value = timezone.now() + timedelta(days=10)

        url = reverse("edit_phase")

        data = {
            "phase_id": self.test_phase.id,
            "lane_id": self.test_lane.id,
            "inspection": self.test_phase.phase_type,
            "start": new_value.date(),
            "end": self.test_phase.end_date.strftime("%Y-%m-%d"),
        }
        response = self.client.post(
            url,
            data,
            headers={"X-On-Behalf-Of": self.admin.user_id},
            content_type=self.json_content,
        )
        edited_phase = PlannedPhase.objects.get(id=self.test_phase.id)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Phase Edited Successfully")
        self.assertEqual(edited_phase.start_date, new_value.date())
