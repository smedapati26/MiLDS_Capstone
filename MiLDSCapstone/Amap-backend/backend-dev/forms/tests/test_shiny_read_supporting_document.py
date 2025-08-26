from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from utils.tests import (
    create_test_soldier,
    create_test_unit,
    create_test_4856_pdf,
    create_single_test_event,
    create_single_supporting_document_type,
    create_single_test_supporting_document,
)
from utils.http.constants import (
    HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST,
)


@tag("supporting_document")
class ReadSupportingDocument(TestCase):
    # Initial setup for the read Supporting Document endpoint functionality
    def setUp(self):
        self.unit = create_test_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="51198")
        self.document = create_test_4856_pdf()
        self.doc_type_orders = create_single_supporting_document_type("Orders")
        self.doc_type_award = create_single_supporting_document_type("Award")
        self.related_event = create_single_test_event(
            soldier=self.soldier, recorded_by=self.uploading_soldier, uic=self.unit
        )

        self.supporting_doc = create_single_test_supporting_document(
            soldier=self.soldier, document_type=self.doc_type_orders, document=self.document, id=1
        )

        self.second_supporting_doc = create_single_test_supporting_document(
            soldier=self.soldier,
            document_type=self.doc_type_orders,
            document=self.document,
            document_title="Second Doc",
            id=2,
        )

        self.request_url = reverse("read_supporting_document", kwargs={"supporting_doc_ids": self.supporting_doc.id})
        self.request_headers = {"X-On-Behalf-Of": self.uploading_soldier.user_id}
        self.request_data = {
            "document_type": self.doc_type_award.type,
            "visible_to_user": False,
            "related_event": self.related_event.id,
        }

    @tag("invalid_supporting_doc_id")
    def test_invalid_supporting_doc_id(self):
        # Update request
        request_url = reverse("read_supporting_document", kwargs={"supporting_doc_ids": "51198"})

        # Make the request
        resp = self.client.get(path=request_url, headers=self.request_headers)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST)

    @tag("valid")
    def test_valid(self):
        # Make the request
        resp = self.client.get(path=self.request_url, headers=self.request_headers)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)

    @tag("valid_multiple")
    def test_valid(self):
        request_url = reverse(
            "read_supporting_document",
            kwargs={"supporting_doc_ids": str(self.supporting_doc.id) + "," + str(self.second_supporting_doc.id)},
        )

        # Make the request
        resp = self.client.get(path=request_url, headers=self.request_headers)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
