import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.model_utils import ModificationTypes
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
)
from utils.tests import create_single_test_modification, create_single_test_modification_category


@tag("aircraft", "read", "modification_category")
class ModificationCategoryReadTestCase(TestCase):
    def setUp(self):
        self.modification = create_single_test_modification("Wings", type=ModificationTypes.CATEGORY)
        self.modification_category = create_single_test_modification_category(modification=self.modification)

    def test_get_with_non_existing_modification(self):
        response = self.client.get(
            reverse(
                "read_modification_category", kwargs={"name": "DOESNOTEXIST", "value": self.modification_category.value}
            ),
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    def test_get_with_non_existing_modification_category(self):
        response = self.client.get(
            reverse("read_modification_category", kwargs={"name": self.modification.name, "value": "DOESNOTEXIST"}),
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST)

    def test_get_with_valid_modification_category(self):
        response = self.client.get(
            reverse(
                "read_modification_category",
                kwargs={"name": self.modification.name, "value": self.modification_category.value},
            ),
        )

        expected_data = {
            "modification": str(self.modification),
            "value": self.modification_category.value,
            "description": self.modification_category.description,
        }

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)
