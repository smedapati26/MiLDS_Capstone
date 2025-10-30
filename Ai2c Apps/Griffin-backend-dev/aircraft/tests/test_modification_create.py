import json
from http import HTTPStatus

from django.db import transaction
from django.test import TestCase, tag
from django.urls import reverse

from aircraft.model_utils import ModificationTypes
from aircraft.models import Modification, ModificationCategory
from utils.http.constants import HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY


@tag("aircraft", "create", "modification")
class ModificationCreateTestCase(TestCase):
    def test_post_with_invalid_json_body(self):
        new_data = {
            "INVALID": ModificationTypes.INSTALL,
        }

        response = self.client.post(
            reverse("create_modification", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

        # Assert no Modifications were made.
        self.assertEqual(Modification.objects.count(), 0)

    def test_post_with_existing_modification_name(self):
        # Set up the API call
        new_data = {
            "type": ModificationTypes.INSTALL,
        }

        # Create a Modification with the type Wings already
        response = self.client.post(
            reverse("create_modification", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(Modification.objects.count(), 1)

        # Make the API call again
        with transaction.atomic():
            response = self.client.post(
                reverse("create_modification", kwargs={"name": "Wings"}),
                data=json.dumps(new_data),
                content_type="application/json",
            )

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), "Modification could not be created.")

        # Assert no new Modifications were made.
        self.assertEqual(Modification.objects.count(), 1)

    def test_post_with_valid_data_and_invalid_type(self):
        new_data = {
            "type": "NOT" + ModificationTypes.INSTALL,
        }

        response = self.client.post(
            reverse("create_modification", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully created.")

        # Assert Modification was created.
        self.assertEqual(Modification.objects.count(), 1)

        # Assert Modification type defaulted to OTHER
        self.assertEqual(Modification.objects.all().first().type, ModificationTypes.OTHER)

    def test_categorical_with_no_categories(self):
        new_data = {"type": ModificationTypes.CATEGORY}

        response = self.client.post(
            reverse("create_modification", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_categorical_with_comples_categories(self):
        new_data = {
            "type": ModificationTypes.CATEGORY,
            "categories": ["Category 1-Description 1", "Category 2-Description 2", "Category 3"],
        }

        response = self.client.post(
            reverse("create_modification", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully created.")
        self.assertEqual(ModificationCategory.objects.count(), len(new_data["categories"]))

    def test_post_with_valid_data(self):
        new_data = {
            "type": ModificationTypes.INSTALL,
        }

        response = self.client.post(
            reverse("create_modification", kwargs={"name": "Wings"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully created.")

        # Assert Modification was created.
        self.assertEqual(Modification.objects.count(), 1)
