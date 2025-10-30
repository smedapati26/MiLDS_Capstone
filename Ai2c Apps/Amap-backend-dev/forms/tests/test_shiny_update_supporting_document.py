from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import (
    HTTP_404_DA7817_DOES_NOT_EXIST,
    HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST,
    HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST,
)
from utils.tests import (
    create_single_supporting_document_type,
    create_single_test_event,
    create_single_test_supporting_document,
    create_test_4856_pdf,
    create_test_soldier,
    create_testing_unit,
)


@tag("supporting_document")
class UpdateSupportingDocument(TestCase):
    # Initial setup for the update Supporting Document endpoint functionality
    def setUp(self):
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="51198")
        self.document = create_test_4856_pdf()
        self.doc_type_orders = create_single_supporting_document_type("Orders")
        self.doc_type_award = create_single_supporting_document_type("Award")
        self.related_event = create_single_test_event(
            soldier=self.soldier, recorded_by=self.uploading_soldier, uic=self.unit
        )

        self.supporting_doc = create_single_test_supporting_document(
            soldier=self.soldier, document_type=self.doc_type_orders, document=self.document
        )

        self.request_url = reverse("update_supporting_document", kwargs={"supporting_doc_id": self.supporting_doc.id})
        self.request_headers = {"X-On-Behalf-Of": self.uploading_soldier.user_id}
        self.request_data = {
            "document_type": self.doc_type_award.type,
            "visible_to_user": False,
            "related_event": self.related_event.id,
        }

    @tag("invalid_supporting_doc_id")
    def test_invalid_supporting_doc_id(self):
        # Update request
        request_url = reverse("update_supporting_document", kwargs={"supporting_doc_id": 51198})

        # Make the request
        resp = self.client.put(
            path=request_url, headers=self.request_headers, data=self.request_data, content_type="application/json"
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST)

    @tag("invalid_supporting_document_type")
    def test_invalid_supporting_document_type(self):
        # Update request
        request_data = {
            "document_type": "INVALID",
            "visible_to_user": False,
            "related_event": self.related_event.id,
        }

        # Make the request
        resp = self.client.put(
            path=self.request_url, headers=self.request_headers, data=request_data, content_type="application/json"
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST)

    @tag("invalid_related_event_id")
    def test_invalid_related_event_id(self):
        # Update request
        request_data = {
            "document_type": self.doc_type_award.type,
            "visible_to_user": False,
            "related_event": 51198,
        }

        # Make the request
        resp = self.client.put(
            path=self.request_url, headers=self.request_headers, data=request_data, content_type="application/json"
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_DA7817_DOES_NOT_EXIST)

    @tag("valid_partial_update")
    def test_valid_partial_update(self):
        # Update request
        self.request_data = {"visible_to_user": self.request_data["visible_to_user"]}

        # Make the request
        resp = self.client.put(
            path=self.request_url, headers=self.request_headers, data=self.request_data, content_type="application/json"
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.content.decode("utf-8"),
            "Supporting Document {} updated.".format(self.supporting_doc.document_title),
        )

        # Assert data is updated as expected
        self.supporting_doc.refresh_from_db()

        self.assertEqual(self.supporting_doc.visible_to_user, self.request_data["visible_to_user"])

    @tag("valid_full_update")
    def test_valid_full_update(self):
        # Make the request
        resp = self.client.put(
            path=self.request_url, headers=self.request_headers, data=self.request_data, content_type="application/json"
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.content.decode("utf-8"),
            "Supporting Document {} updated.".format(self.supporting_doc.document_title),
        )

        # Assert data is updated as expected
        self.supporting_doc.refresh_from_db()

        self.assertEqual(self.supporting_doc.document_type.type, self.request_data["document_type"])
        self.assertEqual(self.supporting_doc.related_event.id, self.request_data["related_event"])
        self.assertEqual(self.supporting_doc.visible_to_user, self.request_data["visible_to_user"])
