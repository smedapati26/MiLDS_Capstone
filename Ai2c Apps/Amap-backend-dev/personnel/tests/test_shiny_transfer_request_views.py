from django.test import TestCase, tag
from django.urls import reverse

from notifications.models import SoldierNotification
from personnel.model_utils import UserRoleAccessLevel
from personnel.models import SoldierTransferRequest, UserRole
from units.models import Unit
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_TRANSFER_REQUEST_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_BAD_SERVER_STATUS_CODE,
    HTTP_ERROR_MESSAGE_INVALID_GET_TRANSFER,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_soldier, create_test_transfer_request, create_testing_unit, create_user_role_in_all


@tag("personnel", "shiny_soldier_transfer_requests")
class SoldierTransferRequestTests(TestCase):
    json_content = "application/json"
    get_transfer_request_url = "personnel:shiny_get_transfer_requests"
    create_transfer_request_url = "personnel:shiny_create_transfer_request"
    adjudicate_transfer_request_url = "personnel:shiny_adjudicate_transfer_request"

    def setUp(self) -> None:
        # Create Units
        self.current_owning_bn = create_testing_unit(uic="OWNING_BN", echelon=Unit.Echelon.BATTALION)
        self.current_unit = create_testing_unit(
            uic="OWNING",
            short_name="A CO, 1-100 TEST",
            display_name="Alpha Company, 1st Battalion, 100th Test Aviation Regiment",
            echelon=Unit.Echelon.COMPANY,
            parent_unit=self.current_owning_bn,
        )
        self.requesting_unit_1 = create_testing_unit(
            uic="REQUEST1",
            short_name="B CO, 2-100 TEST",
            display_name="Bravo Company, 2nd Battalion, 100th Test Aviation Regiment",
            echelon=Unit.Echelon.COMPANY,
        )
        self.requesting_unit_2 = create_testing_unit(
            uic="REQUEST2",
            short_name="C CO, 2-100 TEST",
            display_name="Charlie Company, 2nd Battalion, 100th Test Aviation Regiment",
            echelon=Unit.Echelon.COMPANY,
        )
        # Set units lists
        self.current_owning_bn.set_all_unit_lists()
        self.current_unit.set_all_unit_lists()
        # Create Soldiers
        self.test_soldier = create_test_soldier(unit=self.current_unit)
        self.test_second_soldier = create_test_soldier(
            unit=self.current_unit, user_id="0000000000", last_name="Requested Jr."
        )
        self.test_requester = create_test_soldier(
            unit=self.requesting_unit_1, user_id="1111111111", last_name="Requester"
        )
        self.test_second_requester = create_test_soldier(
            unit=self.requesting_unit_2, user_id="2222222222", last_name="Requester II"
        )
        self.test_owning_bn_manager = create_test_soldier(
            unit=self.current_unit, user_id="3333333333", last_name="BN manager"
        )
        self.test_amap_manager = create_test_soldier(
            unit=self.current_owning_bn, user_id="4444444444", last_name="A-MAP manager", is_admin=True
        )
        # Create Unit Roles
        self.test_bn_manager_role = create_user_role_in_all(
            self.test_owning_bn_manager,
            units=[self.current_owning_bn, self.requesting_unit_2],
            user_access_level=UserRoleAccessLevel.MANAGER,
        )
        # Create Transfer Requests
        self.test_request = create_test_transfer_request(
            requester=self.test_requester,
            gaining_unit=self.requesting_unit_1,
            soldier=self.test_soldier,
        )
        # Create Competing Request for the same soldier
        self.competing_request = create_test_transfer_request(
            id=2,
            requester=self.test_second_requester,
            gaining_unit=self.requesting_unit_2,
            soldier=self.test_soldier,
        )
        self.test_second_request = create_test_transfer_request(
            id=3,
            requester=self.test_second_requester,
            gaining_unit=self.requesting_unit_2,
            soldier=self.test_second_soldier,
        )
        # Expected User Request Fields
        self.expected_fields = [
            "requester_name",
            "soldier__user_id",
            "soldier_name",
            "soldier__unit__short_name",
            "soldier__unit__uic",
            "gaining_unit__short_name",
            "gaining_unit__uic",
            "managers",
        ]

        self.get_type = {
            "get_type": "pending_user_adjudication",
        }

    # shiny_get_transfer_requests Tests
    @tag("validation")
    def test_get_transfer_requests_with_no_user_id_in_header(self):
        """
        Checks that the get request has the user who made the request in the header
        """
        url = reverse(self.get_transfer_request_url, kwargs=self.get_type)
        response = self.client.get(url, content_type=self.json_content)
        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_get_transfer_requests_with_invalid_user(self):
        """
        Checks that the userid passed is a valid user id
        """
        url = reverse(self.get_transfer_request_url, kwargs=self.get_type)
        response = self.client.get(
            url,
            headers={"X_ON_BEHALF_OF": "NOT" + self.test_owning_bn_manager.user_id},
            content_type=self.json_content,
        )
        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_valid_get_transfer_request_from_manager_user(self):
        """
        Checks that a valid get request from an A-MAP manager returns all requests
        """
        url = reverse(self.get_transfer_request_url, kwargs=self.get_type)
        response = self.client.get(
            url,
            headers={"X_ON_BEHALF_OF": self.test_amap_manager.user_id},
            content_type=self.json_content,
        )

        requests = response.json()["transfer_requests"]
        request_fields = list(requests[0].keys())

        # Check that each transfer request has an empty 'managers' field
        for request in requests:
            self.assertIn("managers", request)
            self.assertEqual(request["managers"], [])

        self.assertEqual(len(requests), SoldierTransferRequest.objects.count())
        self.assertSequenceEqual(set(request_fields), set(self.expected_fields))
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

    @tag("validation")
    def test_valid_get_transfer_request_invalid_get_type(self):
        """
        Checks that a get request with a missing or incorrect get_type parameter returns
        server error
        """

        url = reverse(self.get_transfer_request_url, kwargs={"get_type": "INVALID"})
        response = self.client.get(
            url,
            headers={"X_ON_BEHALF_OF": self.test_owning_bn_manager.user_id},
            content_type=self.json_content,
        )
        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_INVALID_GET_TRANSFER)

    @tag("validation")
    def test_valid_get_transfer_requests_for_non_manager_user(self):
        """
        Checks that a valid get request for soldier transfers pending their adjudication
        from a non amap manager user only returns user requests for soldier in the units that the
        requesting soldier is a unit manager for
        """

        url = reverse(self.get_transfer_request_url, kwargs=self.get_type)
        response = self.client.get(
            url,
            headers={"X_ON_BEHALF_OF": self.test_owning_bn_manager.user_id},
            content_type=self.json_content,
        )
        requests = response.json()["transfer_requests"]
        request_fields = list(requests[0].keys())

        # Check that each transfer request has a populated 'managers' field
        for request in requests:
            self.assertIn("managers", request)
            # Ensure 'managers' is a list of dicts with expected keys
            for manager in request["managers"]:
                self.assertIn("name", manager)
                self.assertIn("unit", manager)
                self.assertIn("dod_email", manager)

        user_manager_roles = UserRole.objects.filter(
            user_id=self.test_owning_bn_manager.user_id, access_level=UserRoleAccessLevel.MANAGER
        )
        users_units = []
        for role in user_manager_roles:
            users_units.extend([role.unit.uic, *role.unit.subordinate_uics])
        transfer_requests = SoldierTransferRequest.objects.filter(soldier__unit__uic__in=users_units)

        self.assertEqual(len(requests), transfer_requests.count())
        self.assertSequenceEqual(set(request_fields), set(self.expected_fields))
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

    @tag("validation")
    def test_valid_get_transfer_requests_from_non_manager_user(self):
        """
        Checks that a valid get request for open soldier transfer requests from a non amap
        manager user only returns user requests for soldier in the units that the requesting
        soldier is a unit manager for
        """

        url = reverse(self.get_transfer_request_url, kwargs={"get_type": "users_pending_requests"})
        response = self.client.get(
            url,
            headers={"X_ON_BEHALF_OF": self.test_owning_bn_manager.user_id},
            content_type=self.json_content,
        )
        requests = response.json()["transfer_requests"]
        request_fields = list(requests[0].keys())

        user_manager_roles = UserRole.objects.filter(
            user_id=self.test_owning_bn_manager.user_id, access_level=UserRoleAccessLevel.MANAGER
        )
        users_units = []
        for role in user_manager_roles:
            users_units.extend([role.unit.uic, *role.unit.subordinate_uics])
        transfer_requests = SoldierTransferRequest.objects.filter(gaining_unit__uic__in=users_units)

        self.assertEqual(len(requests), transfer_requests.count())
        self.assertSequenceEqual(set(request_fields), set(self.expected_fields))
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

    # Shiny_create_transfer_request Tests
    @tag("validation")
    def test_post_transfer_request_invalid_soldier(self):
        """
        Checks that a post request with an invalid soldier id returns not found error
        """
        url = reverse(self.create_transfer_request_url, kwargs={})
        request_body = {
            "soldier_id": "NOT" + self.test_soldier.user_id,
            "gaining_uic": self.requesting_unit_2.uic,
        }
        response = self.client.post(
            url,
            data=request_body,
            headers={"X_ON_BEHALF_OF": self.test_owning_bn_manager.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_post_transfer_request_no_userid_in_header(self):
        """
        Checks that a post request with no user id in the header returns error
        """
        url = reverse(self.create_transfer_request_url, kwargs={})
        request_body = {
            "soldier_id": self.test_soldier.user_id,
            "gaining_uic": self.requesting_unit_2.uic,
        }
        response = self.client.post(
            url,
            data=request_body,
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_post_transfer_request_invalid_gaining_unit(self):
        """
        Checks that a post request with an invalid gaining unit uic returns not found error
        """
        url = reverse(
            self.create_transfer_request_url,
            kwargs={},
        )
        request_body = {
            "soldier_id": self.test_soldier.user_id,
            "gaining_uic": "NOT" + self.requesting_unit_2.uic,
        }
        response = self.client.post(
            url,
            data=request_body,
            headers={"X_ON_BEHALF_OF": self.test_owning_bn_manager.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_post_valid_transfer_request(self):
        """
        Checks that a valid post request is successful
        """
        url = reverse(
            self.create_transfer_request_url,
            kwargs={},
        )
        request_body = {
            "soldier_id": self.test_second_soldier.user_id,
            "gaining_uic": self.requesting_unit_1.uic,
        }
        response = self.client.post(
            url,
            data=request_body,
            headers={"X_ON_BEHALF_OF": self.test_requester.user_id},
            content_type=self.json_content,
        )

        soldier_request = SoldierTransferRequest.objects.filter(
            requester=self.test_requester, gaining_unit=self.requesting_unit_1, soldier=self.test_second_soldier
        )

        transfer_notification = SoldierNotification.objects.filter(soldier=self.test_owning_bn_manager)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "Created Soldier Transfer Request")
        self.assertEqual(soldier_request.exists(), True)
        self.assertEqual(transfer_notification.exists(), True)

    # shiny_adjudicate_transfer_request Tests
    @tag("validation")
    def test_put_transfer_request_invalid_soldier(self):
        """
        Checks that a put request with an invalid soldier id returns not found error
        """
        url = reverse(
            self.adjudicate_transfer_request_url,
            kwargs={},
        )
        request_body = {
            "soldier_id": "NOT" + self.test_soldier.user_id,
            "gaining_uic": self.requesting_unit_1.uic,
            "grant": True,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_put_transfer_request_invalid_unit(self):
        """
        Checks that a put request with an invalid unit uic returns not found error
        """
        url = reverse(
            self.adjudicate_transfer_request_url,
            kwargs={},
        )
        request_body = {
            "soldier_id": self.test_soldier.user_id,
            "gaining_uic": "NOT" + self.requesting_unit_1.uic,
            "grant": True,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_put_request_invalid_transfer_request(self):
        """
        Checks that a put request with a transfer request that does not exist returns does
        not exist error
        """
        url = reverse(
            self.adjudicate_transfer_request_url,
            kwargs={},
        )
        request_body = {
            "soldier_id": self.test_second_soldier.user_id,
            "gaining_uic": self.requesting_unit_1.uic,
            "grant": True,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TRANSFER_REQUEST_DOES_NOT_EXIST)

    @tag("validation")
    def test_put_request_transfer_soldier(self):
        """
        Checks that a put request with a valid soldier transfer is successfully granted and soldier
        is transfered, and all other requests for that soldier are deleted
        """
        url = reverse(
            self.adjudicate_transfer_request_url,
            kwargs={},
        )
        request_body = {
            "soldier_id": self.test_soldier.user_id,
            "gaining_uic": self.requesting_unit_1.uic,
            "grant": True,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        self.test_soldier.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(self.test_soldier.unit, self.requesting_unit_1)
        self.assertFalse(SoldierTransferRequest.objects.filter(soldier=self.test_soldier).exists())

    @tag("validation")
    def test_put_request_deny_transfer(self):
        """
        Checks that a put request with a valid transfer request is properly handles when it is not granted,
        and is deleted
        """
        url = reverse(
            self.adjudicate_transfer_request_url,
            kwargs={},
        )
        request_body = {
            "soldier_id": self.test_soldier.user_id,
            "gaining_uic": self.requesting_unit_1.uic,
            "grant": False,
        }
        response = self.client.put(url, data=request_body, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(self.test_soldier.unit, self.current_unit)
        self.assertFalse(SoldierTransferRequest.objects.filter(id=self.test_request.id).exists())
        self.assertEqual(SoldierTransferRequest.objects.filter(soldier=self.test_soldier).count(), 1)
