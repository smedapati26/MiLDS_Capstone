from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import (
    HTTP_200_NOTIFICATION_READ,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_NOTIFICATION_DOES_NOT_EXIST,
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


@tag("notifications", "mark_notification_as_read")
class TestMarkNotificationAsReadView(TestCase):
    def setUp(self):
        self.url = "notifications:mark_notification_as_read"

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

    def test_mark_notification_as_read_success(self):
        url = reverse(self.url, kwargs={"id": self.notification1.id, "read_all": False})

        response = self.client.put(path=url, headers=self.request_headers)

        self.notification1.refresh_from_db()
        self.notification2.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode(), HTTP_200_NOTIFICATION_READ)
        self.assertTrue(self.notification1.notification_read)
        self.assertFalse(self.notification2.notification_read)

    def test_mark_notification_as_read_read_all_success(self):
        url = reverse(self.url, kwargs={"id": self.notification1.id, "read_all": True})

        response = self.client.put(path=url, headers=self.request_headers)

        self.notification1.refresh_from_db()
        self.notification2.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode(), HTTP_200_NOTIFICATION_READ)
        self.assertTrue(self.notification1.notification_read)
        self.assertTrue(self.notification2.notification_read)

    def test_mark_notification_as_read_no_user_id_in_header(self):
        url = reverse(self.url, kwargs={"id": self.notification1.id, "read_all": False})

        response = self.client.put(path=url)

        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode(), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_mark_notification_as_read_user_does_not_exist(self):
        url = reverse(self.url, kwargs={"id": self.notification1.id, "read_all": False})

        response = self.client.put(path=url, headers={"X-On-Behalf-Of": "NOT" + self.test_user.user_id})

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode(), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    def test_mark_notification_as_read_notification_does_not_exist(self):
        url = reverse(self.url, kwargs={"id": 1000, "read_all": False})

        response = self.client.put(path=url, headers=self.request_headers)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode(), HTTP_404_SOLDIER_NOTIFICATION_DOES_NOT_EXIST)
