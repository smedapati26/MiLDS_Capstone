from datetime import date
from django.test import TestCase, tag
from django.urls import reverse
from forms.models import DA_4856

from utils.tests import create_test_unit, create_test_soldier, create_single_test_event, create_test_4856_pdf

from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST, HTTP_404_DA7817_DOES_NOT_EXIST


@tag("add_da4856")
class ShinyAdd4856Test(TestCase):
    # Initial setup for the add 4856 endpoint functionality
    def setUp(self):
        self.unit = create_test_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.evaluator = create_test_soldier(unit=self.unit, user_id="0101010101", last_name="Evaluator")
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="9999999999", last_name="Uploader")
        self.da7817 = create_single_test_event(soldier=self.soldier, recorded_by=self.evaluator, uic=self.unit)
        self.form_title = "PFC Snuffy Evaluation Counseling 04DEC2021"
        self.date = date(2021, 12, 4)
        self.pdf_counseling = create_test_4856_pdf()
        self.request_headers = {"X-On-Behalf-Of": self.uploading_soldier.user_id}

    @tag("add_da4856_invalid_soldier")
    def test_invalid_soldier(self):
        """
        Checks that a request to add a 4856 with an invalid soldier id passed in the url fails
        """
        url = reverse(
            "shiny_add_4856",
            kwargs={
                "soldier_id": "INVALID",
                "form_title": self.form_title,
                "da_7817_id": "NA",
                "date": self.date,
            },
        )

        response = self.client.post(path=url, headers=self.request_headers, data={"pdf": self.pdf_counseling})

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("add_4856_without_7817")
    def test_add_4856_without_7817(self):
        """
        Checks a valid request to add a 4856 without an associated 7817
        """
        url = reverse(
            "shiny_add_4856",
            kwargs={
                "soldier_id": self.soldier.user_id,
                "form_title": self.form_title,
                "da_7817_id": "NA",
                "date": self.date,
            },
        )

        response = self.client.post(path=url, headers=self.request_headers, data={"pdf": self.pdf_counseling})

        self.assertEqual(response.status_code, 200)

    @tag("add_valid_4856_with_7817")
    def test_add_4856_with_7817(self):
        """
        Checks a valid request to add a 4856 with a valid associated 7817
        """
        url = reverse(
            "shiny_add_4856",
            kwargs={
                "soldier_id": self.soldier.user_id,
                "form_title": self.form_title,
                "da_7817_id": self.da7817.id,
                "date": self.date,
            },
        )

        response = self.client.post(path=url, headers=self.request_headers, data={"pdf": self.pdf_counseling})

        self.assertEqual(response.status_code, 200)

        counseling = DA_4856.objects.filter(soldier=self.soldier).first()
        self.da7817.refresh_from_db()

        self.assertEqual(self.da7817.attached_da_4856, counseling)

    @tag("add_4856_with_invalid_7817")
    def test_add_4856_with_invalid_7817(self):
        """
        Checks a valid request to add a 4856 with a valid associated 7817
        """
        url = reverse(
            "shiny_add_4856",
            kwargs={
                "soldier_id": self.soldier.user_id,
                "form_title": self.form_title,
                "da_7817_id": -1,
                "date": self.date,
            },
        )

        response = self.client.post(path=url, headers=self.request_headers, data={"pdf": self.pdf_counseling})

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_DA7817_DOES_NOT_EXIST)
