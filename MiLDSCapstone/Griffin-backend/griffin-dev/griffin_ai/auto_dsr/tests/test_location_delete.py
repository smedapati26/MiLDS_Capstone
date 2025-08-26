from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from utils.http import HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST
from utils.tests import create_test_location


@tag("auto_dsr", "location", "delete")
class DeleteLocationTestCase(TestCase):
    def setUp(self):
        self.location = create_test_location()

    def test_delete_location_with_invalid_location_id(self):
        # Make the API call
        resp = self.client.delete(reverse("delete_location", kwargs={"id": self.location.id + 51198}))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)

    def test_delete_location_with_valid_location_id(self):
        # Make the API call
        resp = self.client.delete(reverse("delete_location", kwargs={"id": self.location.id}))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Location {} successfully deleted.".format(self.location.name))
