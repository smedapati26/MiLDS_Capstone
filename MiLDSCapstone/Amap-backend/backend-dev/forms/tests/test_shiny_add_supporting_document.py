from datetime import date
from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from forms.models import SupportingDocument

from utils.tests import (
    create_test_soldier,
    create_test_unit,
    create_test_4856_pdf,
    create_single_test_event,
    create_single_supporting_document_type,
)
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_FILES_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
    HTTP_404_DA7817_DOES_NOT_EXIST,
)


@tag("supporting_document")
class AddSupportingDocument(TestCase):
    # Initial setup for the add Supporting Document endpoint functionality
    def setUp(self):
        self.unit = create_test_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="51198")
        self.document_date = "2024-01-01"
        self.document = create_test_4856_pdf()
        self.document_type = create_single_supporting_document_type("Orders")
        self.related_event = create_single_test_event(
            soldier=self.soldier, recorded_by=self.uploading_soldier, uic=self.unit
        )
        self.visible_to_user = True

        self.request_url = reverse(
            "add_supporting_document",
            kwargs={
                "soldier_id": self.soldier.user_id,
                "document_title": "DA4856_BLANK",
                "document_type": self.document_type.type,
                "document_date": self.document_date,
                "da_7817_id": self.related_event.id,
            },
        )
        self.request_headers = {"X-On-Behalf-Of": self.uploading_soldier.user_id}
        self.request_data = {"file": self.document}

    @tag("missing_header_soldier_id")
    def test_missing_header_soldier_id(self):
        # Update request
        self.request_headers.pop("X-On-Behalf-Of")

        # Make the request
        resp = self.client.post(path=self.request_url, headers=self.request_headers, data=self.request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("invalid_header_soldier_id")
    def test_invalid_header_soldier_id(self):
        # Update request
        self.request_headers["X-On-Behalf-Of"] = "INVALID"

        # Make the request
        resp = self.client.post(path=self.request_url, headers=self.request_headers, data=self.request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    @tag("invalid_soldier_id")
    def test_invalid_soldier_id(self):
        # Update request
        request_url = reverse(
            "add_supporting_document",
            kwargs={
                "soldier_id": "INVALID",
                "document_title": "DA4856_BLANK",
                "document_type": self.document_type,
                "document_date": self.document_date,
                "da_7817_id": self.related_event.id,
            },
        )

        # Make the request
        resp = self.client.post(path=request_url, headers=self.request_headers, data=self.request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("invalid_da_7817_id")
    def test_invalid_da_7817_id(self):
        # Update request
        request_url = reverse(
            "add_supporting_document",
            kwargs={
                "soldier_id": self.soldier.user_id,
                "document_title": "DA4856_BLANK",
                "document_type": self.document_type,
                "document_date": self.document_date,
                "da_7817_id": 51198,
            },
        )

        # Make the request
        resp = self.client.post(path=request_url, headers=self.request_headers, data=self.request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_DA7817_DOES_NOT_EXIST)

    @tag("invalid_supporting_document_type")
    def test_invalid_supporting_document_type(self):
        # Update request
        request_url = reverse(
            "add_supporting_document",
            kwargs={
                "soldier_id": self.soldier.user_id,
                "document_title": "DA4856_BLANK",
                "document_type": "INVALID",
                "document_date": self.document_date,
                "da_7817_id": self.related_event.id,
            },
        )

        # Make the request
        resp = self.client.post(path=request_url, headers=self.request_headers, data=self.request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST)

    @tag("invalid_request_body_FILES")
    def test_invalid_request_body_FILES(self):
        # Update request
        self.request_data.pop("file")

        # Make the request
        resp = self.client.post(path=self.request_url, headers=self.request_headers, data=self.request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_FILES_NOT_FORMATTED_PROPERLY)

    @tag("valid_no_da_7817")
    def test_valid_no_da_7817(self):
        # Update request
        request_url = reverse(
            "add_supporting_document",
            kwargs={
                "soldier_id": self.soldier.user_id,
                "document_title": "DA4856_BLANK",
                "document_type": self.document_type.type,
                "document_date": self.document_date,
                "da_7817_id": "None",
            },
        )

        # Make the request
        resp = self.client.post(path=request_url, headers=self.request_headers, data=self.request_data)

        # Assert data is created and retrieve new data
        new_data_query = SupportingDocument.objects.all()
        self.assertEqual(new_data_query.count(), 1)

        supporting_document = new_data_query.first()

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.content.decode("utf-8"),
            "Supporting Document {} created successfully.".format(supporting_document.document_title),
        )

        # Assert new data is created as expected
        self.assertEqual(supporting_document.related_event, None)

    @tag("valid_with_da_7817")
    def test_valid_with_da_7817(self):
        # Make the request
        resp = self.client.post(path=self.request_url, headers=self.request_headers, data=self.request_data)

        # Assert data is created and retrieve new data
        new_data_query = SupportingDocument.objects.all()
        self.assertEqual(new_data_query.count(), 1)

        supporting_document = new_data_query.first()

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.content.decode("utf-8"),
            "Supporting Document {} created successfully.".format(supporting_document.document_title),
        )

        # Assert new data is created as expected
        self.assertEqual(supporting_document.related_event, self.related_event)
