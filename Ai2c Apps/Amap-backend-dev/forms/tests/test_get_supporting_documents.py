import io
import zipfile
from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.supporting_documents.routes import router
from forms.models import SupportingDocument
from utils.tests import (
    create_single_supporting_document_type,
    create_single_test_event,
    create_single_test_supporting_document,
    create_test_4856_pdf,
    create_test_soldier,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("GetSupportingDocuments")
class TestGetSupportingDocument(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("forms.api.supporting_documents.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)
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
            soldier=self.soldier, document_type=self.doc_type_orders, document=self.document, id=1
        )

        self.second_supporting_doc = create_single_test_supporting_document(
            soldier=self.soldier,
            document_type=self.doc_type_orders,
            document=self.document,
            document_title="Second Doc",
            id=2,
        )

        self.get_user_id.return_value = self.uploading_soldier.user_id
        create_user_role_in_all(soldier=self.uploading_soldier, units=[self.unit])

    def test_invalid_document_id(self):
        invalid_document_id = "99999"

        resp = self.client.get(f"/{invalid_document_id}")

        self.assertEqual(resp.status_code, HTTPStatus.UNAUTHORIZED)
        self.assertEqual(resp.json()["detail"], "Requesting user does not have a user role for every soldier's unit.")

    @patch("forms.api.supporting_documents.routes.FileResponse")
    def test_get_single_document(self, mock_file_response):
        mock_response = mock_file_response.return_value

        self.client.get(f"/{self.supporting_doc.id}")

        mock_file_response.assert_called_once()
        args, kwargs = mock_file_response.call_args
        self.assertEqual(kwargs["as_attachment"], True)
        self.assertEqual(kwargs["filename"], f"{self.supporting_doc.document_title}.pdf")

    @patch("forms.api.supporting_documents.routes.FileResponse")
    def test_get_multiple_documents(self, mock_file_response):
        mock_response = mock_file_response.return_value

        document_ids = f"{self.supporting_doc.id},{self.second_supporting_doc.id}"

        self.client.get(f"/{document_ids}")

        mock_file_response.assert_called_once()
        args, kwargs = mock_file_response.call_args
        self.assertEqual(kwargs["as_attachment"], True)
        self.assertEqual(
            kwargs["filename"], f"{self.soldier.first_name}_{self.soldier.last_name}_Supporting_Documents.zip"
        )

    @patch("forms.api.supporting_documents.routes.FileResponse")
    def test_get_multiple_documents_with_one_missing(self, mock_file_response):
        mock_response = mock_file_response.return_value

        document_ids = f"{self.supporting_doc.id},99999"

        self.client.get(f"/{document_ids}")

        mock_file_response.assert_called_once()
        args, kwargs = mock_file_response.call_args
        self.assertEqual(kwargs["as_attachment"], True)
        self.assertEqual(kwargs["filename"], f"{self.supporting_doc.document_title}.pdf")
