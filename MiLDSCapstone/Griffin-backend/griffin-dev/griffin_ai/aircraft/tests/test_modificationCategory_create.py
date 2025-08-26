from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.models import ModificationCategory
from aircraft.model_utils import ModificationTypes
from utils.tests import create_single_test_modification, create_single_test_modification_category
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
)


@tag("aircraft", "create", "modification_category")
class ModificationCategoryCreateTestCase(TestCase):
    def setUp(self):
        self.modification = create_single_test_modification(name="Wings", type=ModificationTypes.CATEGORY)

    def test_post_with_non_existing_modification(self):
        new_data = {"value": "Category 1", "description": "Category 1 descritption."}

        response = self.client.post(
            reverse("create_modification_category", kwargs={"name": "DOESNOTEXIST"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

        # Assert no Modifications Categories were made.
        self.assertEqual(ModificationCategory.objects.count(), 0)

    def test_post_with_non_categorical_modification(self):
        # Update Modification to not be Category
        self.modification.type = ModificationTypes.OTHER
        self.modification.save()

        new_data = {"value": "Category 1", "description": "Category 1 descritption."}

        response = self.client.post(
            reverse("create_modification_category", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(
            response.content.decode("utf-8"), "Modification {} is not of type Category.".format(self.modification.name)
        )

        # Assert no Modifications Categories were made.
        self.assertEqual(ModificationCategory.objects.count(), 0)

    def test_post_with_invalid_value_json(self):
        new_data = {"DOESNOTEXIST": "Category 1", "description": "Category 1 descritption."}

        response = self.client.post(
            reverse("create_modification_category", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

        # Assert no Modifications Categories were made.
        self.assertEqual(ModificationCategory.objects.count(), 0)

    def test_invalid_json(self):
        new_data = {"value": "Category 1", "DOESNOTEXIST": "Category 1 descritption."}

        response = self.client.post(
            reverse("create_modification_category", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

        # Assert no Modifications Categories were made.
        self.assertEqual(ModificationCategory.objects.count(), 0)

    def test_post_with_existing_category_value(self):
        new_category = create_single_test_modification_category(modification=self.modification)

        new_data = {"value": new_category.value, "description": "Category Description"}

        response = self.client.post(
            reverse("create_modification_category", kwargs={"name": self.modification.name}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Modification Category could not be created; it is likely that {} for {} already exists.".format(
                new_data["value"], self.modification.name
            ),
        )

    def test_post_with_valid_save(self):
        new_data = {"value": "Category 1", "description": "Category 1 descritption."}

        response = self.client.post(
            reverse("create_modification_category", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification Category successfully created.")

        # Assert Modifications Category was created.
        self.assertEqual(ModificationCategory.objects.count(), 1)
