from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.model_utils import ModificationTypes

from utils.tests import create_single_test_modification, create_single_test_modification_category
from utils.http.constants import HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST


@tag("aircraft", "modification_category")
class GetModificationCategoriesTest(TestCase):
    def setUp(self):
        self.modification = create_single_test_modification(name="Category", type=ModificationTypes.CATEGORY)

        self.mod_cat_1 = create_single_test_modification_category(modification=self.modification)
        self.mod_cat_2 = create_single_test_modification_category(
            modification=self.modification, value="Category 2", description="Description 2"
        )
        self.mod_cat_3 = create_single_test_modification_category(
            modification=self.modification, value="Category 3", description="Description 3"
        )

    def test_get_modification_categories_with_invalid_modification(self):
        response = self.client.get(
            reverse("get_modification_categories", kwargs={"name": "NOT" + self.modification.name})
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    def test_get_modification_categories_with_no_categories(self):
        self.mod_cat_1.delete()
        self.mod_cat_2.delete()
        self.mod_cat_3.delete()

        response = self.client.get(reverse("get_modification_categories", kwargs={"name": self.modification.name}))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), [])

    def test_get_modification_categories_with_single_category(self):
        self.mod_cat_2.delete()
        self.mod_cat_3.delete()

        response = self.client.get(reverse("get_modification_categories", kwargs={"name": self.modification.name}))

        expected_data = [{"value": self.mod_cat_1.value, "description": self.mod_cat_1.description}]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)

    def test_get_modification_categories_with_multiple_category(self):
        response = self.client.get(reverse("get_modification_categories", kwargs={"name": self.modification.name}))

        expected_data = [
            {"value": self.mod_cat_1.value, "description": self.mod_cat_1.description},
            {"value": self.mod_cat_2.value, "description": self.mod_cat_2.description},
            {"value": self.mod_cat_3.value, "description": self.mod_cat_3.description},
        ]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)
