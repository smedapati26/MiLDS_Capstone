from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from forms.models import SupportingDocument
from utils.http.constants import HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST
from utils.tests import (
    create_single_supporting_document_type,
    create_single_test_supporting_document,
    create_test_soldier,
    create_testing_unit,
)


@tag("supporting_document")
class DeleteSupportingDocument(TestCase):
    # Initial setup for the delete Supporting Document endpoint functionality
    def setUp(self):
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="51198")
        self.doc_type = create_single_supporting_document_type("Orders")

        self.supporting_doc = create_single_test_supporting_document(soldier=self.soldier, document_type=self.doc_type)

        self.request_url = reverse("delete_supporting_document", kwargs={"supporting_doc_id": self.supporting_doc.id})
        self.request_headers = {"X-On-Behalf-Of": self.uploading_soldier.user_id}

    @tag("invalid_supporting_doc_id")
    def test_invalid_supporting_doc_id(self):
        # Update request
        request_url = reverse("delete_supporting_document", kwargs={"supporting_doc_id": 51198})

        # Make the request
        resp = self.client.delete(path=request_url, headers=self.request_headers)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST)

    @tag("valid")
    def test_valid(self):
        # Make the request
        resp = self.client.delete(path=self.request_url, headers=self.request_headers)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.content.decode("utf-8"),
            "Supporting Document {} removed from User's view.".format(self.supporting_doc.document_title),
        )

        # Assert data still exists and has been updated
        self.assertEqual(SupportingDocument.objects.filter(id=self.supporting_doc.id).exists(), True)

        self.supporting_doc.refresh_from_db()

        self.assertEqual(self.supporting_doc.visible_to_user, False)
