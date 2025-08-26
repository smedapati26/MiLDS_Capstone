from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST,
)
from utils.tests import create_single_test_modification, create_single_test_modification_category


@tag("aircraft", "update", "modification_category")
class ModificationCategoryUpdateTestCase(TestCase):
    def setUp(self):
        self.modification = create_single_test_modification(name="Wings")
        self.modification_category = create_single_test_modification_category(modification=self.modification)
        self.modification_category_2 = create_single_test_modification_category(
            modification=self.modification, value="Category 2"
        )

    def test_put_with_invalid_modification_name(self):
        update_data = {
            "value": self.modification_category.value,
            "new_value": "New Category",
            "new_description": "New Category Description",
        }

        response = self.client.put(
            reverse("update_modification_category", kwargs={"name": "DOESNOTEXIST"}), data=json.dumps(update_data)
        )

        # Refresh test Modification object
        self.modification_category.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)
        self.assertEqual(self.modification_category.value, "Category")
        self.assertEqual(self.modification_category.description, "Category Description")

    def test_put_with_invalid_json(self):
        update_data = {
            "DOESNOTEXIST": self.modification_category.value,
            "new_value": "New Category",
            "new_description": "New Category Description",
        }

        response = self.client.put(
            reverse("update_modification_category", kwargs={"name": self.modification.name}),
            data=json.dumps(update_data),
        )

        # Refresh test Modification object
        self.modification_category.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
        self.assertEqual(self.modification_category.value, "Category")
        self.assertEqual(self.modification_category.description, "Category Description")

    def test_put_with_invalid_modification(self):
        update_data = {
            "value": "DOESNOTEXIST",
            "new_value": "New Category",
            "new_description": "New Category Description",
        }

        response = self.client.put(
            reverse("update_modification_category", kwargs={"name": self.modification.name}),
            data=json.dumps(update_data),
        )

        # Refresh test Modification object
        self.modification_category.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST)
        self.assertEqual(self.modification_category.value, "Category")
        self.assertEqual(self.modification_category.description, "Category Description")

    def test_put_with_existing_category_value(self):
        update_data = {"value": self.modification_category.value, "new_value": self.modification_category_2.value}

        response = self.client.put(
            reverse("update_modification_category", kwargs={"name": self.modification.name}),
            data=json.dumps(update_data),
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Modification Category could not be updated; it is likely that {} for {} already exists.".format(
                update_data["new_value"], self.modification.name
            ),
        )
        self.assertEqual(self.modification_category.value, "Category")
        self.assertEqual(self.modification_category.description, "Category Description")

    def test_put_with_no_data_updates(self):
        update_data = {"value": self.modification_category.value}

        response = self.client.put(
            reverse("update_modification_category", kwargs={"name": self.modification.name}),
            data=json.dumps(update_data),
        )

        # Refresh test Modification object
        self.modification_category.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification Category successfully updated.")
        self.assertEqual(self.modification_category.value, "Category")
        self.assertEqual(self.modification_category.description, "Category Description")

    def test_put_with_both_data_updates(self):
        update_data = {
            "value": self.modification_category.value,
            "new_value": "New Category",
            "new_description": "New Category Description",
        }

        response = self.client.put(
            reverse("update_modification_category", kwargs={"name": self.modification.name}),
            data=json.dumps(update_data),
        )

        # Refresh test Modification object
        self.modification_category.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification Category successfully updated.")
        self.assertEqual(self.modification_category.value, "New Category")
        self.assertEqual(self.modification_category.description, "New Category Description")
