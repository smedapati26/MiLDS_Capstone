from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase
from ninja.testing import TestClient

from forms.api.supporting_documents.routes import router
from forms.models import SupportingDocument
from utils.tests import (
    create_single_supporting_document_type,
    create_single_test_supporting_document,
    create_test_soldier,
    create_testing_unit,
)


class TestDeleteSupportingDocument(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="51198")
        self.doc_type = create_single_supporting_document_type("Orders")
        self.supporting_doc = create_single_test_supporting_document(
            soldier=self.soldier, document_type=self.doc_type, document_title="Test Document"
        )

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_invalid_document_id(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        invalid_document_id = 99999

        resp = self.client.delete(f"/{invalid_document_id}")

        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.json()["detail"], "Not Found")

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_valid_deletion(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        doc = SupportingDocument.objects.get(id=self.supporting_doc.id)
        self.assertTrue(doc.visible_to_user)

        resp = self.client.delete(f"/{self.supporting_doc.id}")

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.json(),
            {"message": f"Supporting Document {doc.document_title} removed from User's view.", "success": True},
        )

        doc.refresh_from_db()
        self.assertFalse(doc.visible_to_user)

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_actual_document_deletion(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        doc = SupportingDocument.objects.get(id=self.supporting_doc.id)
        self.assertTrue(doc.visible_to_user)

        resp = self.client.delete(f"/{self.supporting_doc.id}")
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.json(),
            {"message": f"Supporting Document {doc.document_title} removed from User's view.", "success": True},
        )

        doc.refresh_from_db()
        self.assertFalse(doc.visible_to_user)
        self.assertTrue(SupportingDocument.objects.filter(id=self.supporting_doc.id).exists())
