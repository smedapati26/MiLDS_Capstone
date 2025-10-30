import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from forms.models import DA_4856
from utils.http.constants import HTTP_404_DA4856_DOES_NOT_EXIST
from utils.tests import create_test_4856, create_test_4856_pdf, create_test_soldier, create_testing_unit


@tag("forms", "DA_4856", "update")
class ShinyUpdateDA4856Tests(TestCase):
    def setUp(self):
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="9999999999", last_name="Uploader")
        da_4856_pdf = create_test_4856_pdf()
        self.da_4856 = create_test_4856(soldier=self.soldier, document=da_4856_pdf)
        self.request_data = {"date": "1998-05-11", "title": "New 4856 Title"}
        self.request_headers = {"X-On-Behalf-Of": self.uploading_soldier.user_id}

    def test_invalid_4856_id(self):
        # Make the request
        resp = self.client.put(
            reverse("shiny_update_da_4856", kwargs={"da_4856_id": 51198}),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_DA4856_DOES_NOT_EXIST)

        # Assert data is updated as expected
        old_date = self.da_4856.date
        old_title = self.da_4856.title

        self.da_4856.refresh_from_db()

        new_date = self.da_4856.date
        new_title = self.da_4856.title

        self.assertEqual(new_date, old_date)
        self.assertEqual(new_title, old_title)

    def test_valid_request_with_no_update_data(self):
        # Make the request
        resp = self.client.put(
            reverse("shiny_update_da_4856", kwargs={"da_4856_id": self.da_4856.id}),
            headers=self.request_headers,
            data=json.dumps({}),
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "DA 4856 successfully updated.")

        # Assert data is updated as expected
        old_date = self.da_4856.date
        old_title = self.da_4856.title

        self.da_4856.refresh_from_db()

        new_date = self.da_4856.date
        new_title = self.da_4856.title

        self.assertEqual(new_date, old_date)
        self.assertEqual(new_title, old_title)

    def test_valid_request_with_full_update_data(self):
        # Make the request
        resp = self.client.put(
            reverse("shiny_update_da_4856", kwargs={"da_4856_id": self.da_4856.id}),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "DA 4856 successfully updated.")

        # Assert data is updated as expected
        expected_date = self.request_data["date"]
        expected_title = self.request_data["title"]

        self.da_4856.refresh_from_db()

        actual_date = str(self.da_4856.date)
        actual_title = self.da_4856.title

        self.assertEqual(actual_date, expected_date)
        self.assertEqual(actual_title, expected_title)
