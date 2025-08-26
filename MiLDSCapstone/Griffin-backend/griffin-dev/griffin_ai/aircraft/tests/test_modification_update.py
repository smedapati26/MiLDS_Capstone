from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.model_utils import ModificationTypes

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)
from utils.tests import create_single_test_modification


@tag("aircraft", "update", "modification")
class ModificationUpdateTestCase(TestCase):
    def setUp(self):
        self.modification = create_single_test_modification(name="Wings")

    def test_put_with_invalid_modification(self):
        update_data = {"type": ModificationTypes.COUNT}

        response = self.client.put(
            reverse("update_modification", kwargs={"name": "DOESNOTEXIST"}), data=json.dumps(update_data)
        )

        # Refresh test Modification object
        self.modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)
        self.assertEqual(self.modification.type, ModificationTypes.OTHER)

    def test_put_with_invalid_json(self):
        update_data = {"DOESNOTEXIST": ModificationTypes.COUNT}

        response = self.client.put(
            reverse("update_modification", kwargs={"name": self.modification.name}), data=json.dumps(update_data)
        )

        # Refresh test Modification object
        self.modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
        self.assertEqual(self.modification.type, ModificationTypes.OTHER)

    def test_put_with_invalid_modification_type(self):
        update_data = {"type": "DOESNOTEXIST"}

        response = self.client.put(
            reverse("update_modification", kwargs={"name": self.modification.name}), data=json.dumps(update_data)
        )

        # Refresh test Modification object
        self.modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), "New Modification Type selection invalid.")
        self.assertEqual(self.modification.type, ModificationTypes.OTHER)

    def test_put_with_valid_update(self):
        update_data = {"type": ModificationTypes.COUNT}

        response = self.client.put(
            reverse("update_modification", kwargs={"name": self.modification.name}), data=json.dumps(update_data)
        )

        # Refresh test Modification object
        self.modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully updated.")
        self.assertEqual(self.modification.type, ModificationTypes.COUNT)
