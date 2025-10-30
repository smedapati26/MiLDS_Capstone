from django.test import TestCase, tag
from django.urls import reverse

from notifications.models import SoldierNotification
from personnel.model_utils import UserRoleAccessLevel
from personnel.models import UserRequest, UserRole
from units.models import Unit
from utils.http.constants import (
    HTTP_404_REQUEST_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_BAD_SERVER_STATUS_CODE,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_soldier, create_test_user_request, create_testing_unit, create_user_role_in_all


@tag("personnel", "shiny_user_request")
class UserRequestTests(TestCase):
    json_content = "application/json"
    user_request_url = "personnel:shiny_user_requests"

    # Initial setup for the user request endpoint functionality
    # -- Creating the needed models
    def setUp(self) -> None:
        # Create Units
        self.test_bn = create_testing_unit()
        self.test_co = create_testing_unit(
            uic="TEST000A0", echelon=Unit.Echelon.COMPANY, short_name="A CO, 1-100 TEST", parent_unit=self.test_bn
        )
        self.test_second_co = create_testing_unit(
            uic="TEST000B0", echelon=Unit.Echelon.COMPANY, short_name="A CO, 2-100 TEST"
        )
        # Create Soldiers
        self.test_requestor = create_test_soldier(unit=self.test_co)
        self.test_co_manager = create_test_soldier(unit=self.test_co, user_id="1111111111", last_name="CO Manager")
        self.test_co_recorder = create_test_soldier(
            unit=self.test_second_co, user_id="1212121212", last_name="CO Admin"
        )
        self.test_admin = create_test_soldier(unit=self.test_co, user_id="2222222222", last_name="Admin", is_admin=True)

        # Create User Role for CO Manager
        create_user_role_in_all(
            soldier=self.test_co_manager, units=[self.test_co], user_access_level=UserRoleAccessLevel.MANAGER
        )
        # Create User Role for BN Evaluator
        create_user_role_in_all(
            soldier=self.test_co_manager, units=[self.test_bn], user_access_level=UserRoleAccessLevel.EVALUATOR
        )
        # Create User Role for CO manager
        create_user_role_in_all(
            soldier=self.test_co_manager, units=[self.test_second_co], user_access_level=UserRoleAccessLevel.MANAGER
        )
        # Create User Elevated Permission Requests
        self.bn_evaluator_request = create_test_user_request(
            user_id=self.test_requestor, uic=self.test_bn, access_level=UserRoleAccessLevel.EVALUATOR
        )
        self.co_manager_request = create_test_user_request(
            user_id=self.test_requestor, uic=self.test_co, id=2, access_level=UserRoleAccessLevel.MANAGER
        )
        # Expected User Request Fields
        self.expected_fields = ["user_id", "name", "uic__short_name", "access_level"]

    # GET Tests
    @tag("validation")
    def test_get_requests_with_no_user_id_in_header(self):
        """
        Checks that the get request has the user who made the request in the header
        """
        url = reverse(self.user_request_url, kwargs={})
        response = self.client.get(url, content_type=self.json_content)
        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_get_requests_with_invalid_user(self):
        """
        Checks that the userid passed is a valid user id
        """
        url = reverse(self.user_request_url, kwargs={})
        response = self.client.get(
            url,
            headers={"X_ON_BEHALF_OF": "NOT" + self.test_co_manager.user_id},
            content_type=self.json_content,
        )
        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_valid_get_request_from_admin_user(self):
        """
        Checks that a valid get request from an A-MAP admin returns all requests
        """

        url = reverse(self.user_request_url, kwargs={})
        response = self.client.get(
            url,
            headers={"X_ON_BEHALF_OF": self.test_admin.user_id},
            content_type=self.json_content,
        )
        requests = response.json()["requests"]
        request_fields = list(requests[0].keys())

        self.assertEqual(len(requests), UserRequest.objects.count())
        self.assertSequenceEqual(set(request_fields), set(self.expected_fields))
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

    @tag("validation")
    def test_valid_get_request_from_non_admin_user(self):
        """
        Checks that a valid get request from a non admin user only returns user requests from units that the
        requesting soldier is a unit admin/manager for
        """

        url = reverse(self.user_request_url, kwargs={})
        response = self.client.get(
            url,
            headers={"X_ON_BEHALF_OF": self.test_co_manager.user_id},
            content_type=self.json_content,
        )
        requests = response.json()["requests"]
        request_fields = list(requests[0].keys())

        users_roles = UserRole.objects.filter(user_id=self.test_co_manager.user_id)
        elevated_user_roles = users_roles.exclude(
            access_level__in=[UserRoleAccessLevel.VIEWER, UserRoleAccessLevel.EVALUATOR]
        )
        users_units = []
        for role in elevated_user_roles:
            users_units.extend([role.unit.uic, *role.unit.subordinate_uics])
        access_requests = UserRequest.objects.filter(uic__in=users_units)

        self.assertEqual(len(requests), access_requests.count())
        self.assertSequenceEqual(set(request_fields), set(self.expected_fields))
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

    # POST Tests
    @tag("validation")
    def test_post_request_invalid_soldier(self):
        """
        Checks that a post request with an invalid soldier id returns not found error
        """
        url = reverse(
            self.user_request_url,
            kwargs={},
        )
        request_body = {
            "user_id": "NOT" + self.test_requestor.user_id,
            "uic": self.test_co.uic,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }
        response = self.client.post(url, data=request_body, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_post_request_invalid_unit(self):
        """
        Checks that a post request with an invalid unit uic returns not found error
        """
        url = reverse(
            self.user_request_url,
            kwargs={},
        )
        request_body = {
            "user_id": self.test_requestor.user_id,
            "uic": "NOT" + self.test_co.uic,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }
        response = self.client.post(url, data=request_body, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_post_valid_request(self):
        """
        Checks that a valid post request is successful
        """
        url = reverse(
            self.user_request_url,
            kwargs={},
        )
        request_body = {
            "user_id": self.test_requestor.user_id,
            "uic": self.test_second_co.uic,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }
        response = self.client.post(url, data=request_body, content_type=self.json_content)

        soldier_request = UserRequest.objects.filter(uic=self.test_second_co.uic)

        access_notification = SoldierNotification.objects.filter(soldier=self.test_co_manager)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "Created Access Request")
        self.assertEqual(soldier_request.exists(), True)
        self.assertEqual(access_notification.exists(), True)

    # PUT Tests
    @tag("validation")
    def test_put_request_invalid_soldier(self):
        """
        Checks that a put request with an invalid soldier id returns not found error
        """
        url = reverse(
            self.user_request_url,
            kwargs={},
        )
        request_body = {
            "user_id": "NOT" + self.test_requestor.user_id,
            "uic": self.test_co.uic,
            "access_level": UserRoleAccessLevel.EVALUATOR,
            "grant": True,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_put_request_invalid_unit(self):
        """
        Checks that a put request with an invalid unit uic returns not found error
        """
        url = reverse(
            self.user_request_url,
            kwargs={},
        )
        request_body = {
            "user_id": self.test_requestor.user_id,
            "uic": "NOT" + self.test_co.uic,
            "access_level": UserRoleAccessLevel.EVALUATOR,
            "grant": True,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_put_request_invalid_access_request(self):
        """
        Checks that a put request with an invalid access request returns not found error
        """
        url = reverse(
            self.user_request_url,
            kwargs={},
        )
        request_body = {
            "user_id": self.test_requestor.user_id,
            "uic": self.test_second_co.uic,
            "access_level": UserRoleAccessLevel.EVALUATOR,
            "grant": True,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_REQUEST_DOES_NOT_EXIST)

    @tag("validation")
    def test_put_request_set_access_level(self):
        """
        Checks that a put request with an access request that sets new permissions for a user on a
        given unit, when granted is properly adjudicated
        """
        url = reverse(
            self.user_request_url,
            kwargs={},
        )
        request_body = {
            "user_id": self.test_requestor.user_id,
            "uic": self.test_bn.uic,
            "access_level": UserRoleAccessLevel.EVALUATOR,
            "grant": True,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        # Get soldier's role in test_bn
        soldier_role = UserRole.objects.get(user_id=self.test_requestor.user_id, unit=self.test_bn.uic)
        # Get soldier's request - should be deleted
        soldier_request = UserRequest.objects.filter(user_id=self.test_requestor.user_id, uic=self.test_bn.uic)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsNotNone(soldier_role)
        self.assertEqual(len(soldier_request), 0)
        self.assertEqual(soldier_role.access_level, UserRoleAccessLevel.EVALUATOR)

    @tag("validation")
    def test_put_request_deny_access_level(self):
        """
        Checks that a put request with an access request that sets new permissions for a user on a
        given unit, when not granted does not create a new user role, and deletes the corresponding
        UserRequest object
        """
        url = reverse(
            self.user_request_url,
            kwargs={},
        )
        request_body = {
            "user_id": self.test_requestor.user_id,
            "uic": self.test_bn.uic,
            "access_level": UserRoleAccessLevel.EVALUATOR,
            "grant": False,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        # Get soldier's role in test_bn
        soldier_role = UserRole.objects.filter(user_id=self.test_requestor.user_id, unit=self.test_bn.uic)
        # Get soldier's request - should be deleted
        soldier_request = UserRequest.objects.filter(user_id=self.test_requestor.user_id, uic=self.test_bn.uic)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(soldier_role), 0)
        self.assertEqual(len(soldier_request), 0)

    @tag("validation")
    def test_put_request_change_access_level(self):
        """
        Checks that a put request with an access request that changes permissions correctly updates
        the user's access level if it is granted
        """
        # Create VIEWER UserRole for test_requestor
        create_user_role_in_all(
            soldier=self.test_requestor, units=[self.test_co], user_access_level=UserRoleAccessLevel.VIEWER
        )
        url = reverse(
            self.user_request_url,
            kwargs={},
        )
        request_body = {
            "user_id": self.test_requestor.user_id,
            "uic": self.test_co.uic,
            "access_level": UserRoleAccessLevel.MANAGER,
            "grant": True,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)
        # Get soldier's role in test_co
        soldier_role = UserRole.objects.get(user_id=self.test_requestor.user_id, unit=self.test_co.uic)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(soldier_role.access_level, UserRoleAccessLevel.MANAGER)
