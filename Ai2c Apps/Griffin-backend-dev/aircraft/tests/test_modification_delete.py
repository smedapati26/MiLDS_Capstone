from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.models import Modification
from utils.http.constants import HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST
from utils.tests import create_single_test_modification


@tag("aircraft", "delete", "modification")
class ModificationDeleteTestCase(TestCase):
    def setUp(self):
        self.modification = create_single_test_modification(name="Wings")

    def test_delete_with_invalid_modification(self):
        response = self.client.delete(reverse("delete_modification", kwargs={"name": "DOESNOTEXIST"}))

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)
        self.assertEqual(Modification.objects.count(), 1)

    def test_delete_with_valid_modification(self):
        response = self.client.delete(reverse("delete_modification", kwargs={"name": self.modification.name}))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully deleted.")
        self.assertEqual(Modification.objects.count(), 0)
