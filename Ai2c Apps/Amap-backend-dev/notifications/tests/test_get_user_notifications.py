from django.test import TestCase, tag
from django.urls import reverse

from notifications.models import AccessRequestNotification, TransferRequestNotification
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_BAD_SERVER_STATUS_CODE,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import (
    create_test_access_request_notification,
    create_test_soldier,
    create_test_soldier_notification,
    create_test_transfer_request,
    create_test_transfer_request_notification,
    create_test_user_request,
    create_testing_unit,
)


@tag("notifications", "get_user_notifications")
class GetUserNotifications(TestCase):
    get_user_notifications_url = "notifications:get_user_notifications"

    # Initial setup for the get all elevated roles endpoint functionality
    def setUp(self) -> None:
        # Create Units
        self.test_unit_1 = create_testing_unit()
        self.test_unit_2 = create_testing_unit(uic="TESTAA")
        # Create Soldiers
        self.test_user = create_test_soldier(unit=self.test_unit_1)
        self.test_soldier = create_test_soldier(unit=self.test_unit_2, user_id="0101010101")
        self.test_requester = create_test_soldier(unit=self.test_unit_1, user_id="0010010010")
        # Create Transfer and Access Requests
        self.access_request = create_test_user_request(user_id=self.test_soldier, uic=self.test_unit_1)
        self.transfer_request = create_test_transfer_request(
            requester=self.test_requester, gaining_unit=self.test_unit_1, soldier=self.test_soldier
        )
        # Create Notifications
        self.access_request_notification = create_test_access_request_notification(
            access_request=self.access_request,
        )
        self.transfer_request_notification = create_test_transfer_request_notification(
            transfer_request=self.transfer_request, id=2
        )
        # Apply Notifications to Soldier
        self.notification1 = create_test_soldier_notification(
            soldier=self.test_user, notification=self.access_request_notification
        )
        self.notification2 = create_test_soldier_notification(
            soldier=self.test_user, notification=self.transfer_request_notification, id=2
        )

        self.request_headers = {"X-On-Behalf-Of": self.test_user.user_id}

    @tag("validation")
    def test_get_user_notifications_no_header(self):
        """
        Checks that a get request with no header returns error
        """
        url = reverse(self.get_user_notifications_url)
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_get_user_notifications_invalid_user(self):
        """
        Checks that a get request with invalid user_id returns not found
        """
        url = reverse(self.get_user_notifications_url)
        response = self.client.get(url, headers={"X-On-Behalf-Of": "INVALID"})
        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_get_user_notifications_200(self):
        """
        Checks that a get request returns the desired notifications
        """
        url = reverse(self.get_user_notifications_url)
        response = self.client.get(url, headers=self.request_headers)
        notifications = response.json()["notifications"]
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(notifications), 2)
