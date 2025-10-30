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
    create_test_designation,
    create_test_soldier,
    create_test_soldier_designation,
    create_testing_unit,
)


@tag("forms", "supporting_document")
class TestUpdateSupportingDocument(TestCase):
    def setUp(self):
        self.client = TestClient(router)
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="51198")
        self.document = create_test_4856_pdf()
        self.doc_type_orders = create_single_supporting_document_type("Orders")
        self.doc_type_award = create_single_supporting_document_type("Award")
        self.related_event_1 = create_single_test_event(
            soldier=self.soldier, recorded_by=self.uploading_soldier, uic=self.unit
        )
        self.related_event_2 = create_single_test_event(
            soldier=self.soldier, recorded_by=self.uploading_soldier, uic=self.unit, id=2
        )
        self.designation_1 = create_test_designation()
        self.designation_2 = create_test_designation(type="IT", description="IT Desc")
        self.soldier_designation_1 = create_test_soldier_designation(
            soldier=self.soldier, designation=self.designation_1
        )
        self.soldier_designation_2 = create_test_soldier_designation(
            soldier=self.soldier, designation=self.designation_2
        )
        self.supporting_doc = create_single_test_supporting_document(
            soldier=self.soldier,
            document_type=self.doc_type_orders,
            document=self.document,
            document_title="Test Document",
            related_event=self.related_event_1,
            related_designation=self.soldier_designation_1,
        )
        self.request_data = {
            "document_type": self.doc_type_award.type,
            "visible_to_user": False,
            "related_event_id": self.related_event_2.id,
            "document_title": "New Title",
            "related_designation_id": self.soldier_designation_2.id,
        }

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_invalid_document_id(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        invalid_document_id = 99999

        resp = self.client.put(f"/{invalid_document_id}", json=self.request_data)

        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.json()["detail"], "Not Found")

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_invalid_document_type(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        invalid_data = {
            "document_type": "INVALID",
            "visible_to_user": False,
            "related_event_id": self.related_event_1.id,
        }

        resp = self.client.put(f"/{self.supporting_doc.id}", json=invalid_data)

        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.json()["detail"], "Not Found")

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_invalid_event_id(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        invalid_data = {
            "document_type": self.doc_type_award.type,
            "visible_to_user": False,
            "related_event_id": 99999,
        }

        resp = self.client.put(f"/{self.supporting_doc.id}", json=invalid_data)

        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.json()["detail"], "Not Found")

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_partial_update(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        test_doc = SupportingDocument.objects.get(id=self.supporting_doc.id)
        self.assertTrue(test_doc.visible_to_user)

        partial_data = {"visible_to_user": False}

        resp = self.client.put(f"/{self.supporting_doc.id}", json=partial_data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.json(), {"message": f"Supporting Document {test_doc.document_title} updated.", "success": True}
        )

        # Refresh from database and verify changes
        test_doc.refresh_from_db()
        self.assertFalse(test_doc.visible_to_user)

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_remove_event_and_designation(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        test_doc = SupportingDocument.objects.get(id=self.supporting_doc.id)

        # Verify initial state
        self.assertEqual(test_doc.document_type.id, self.doc_type_orders.id)
        self.assertIsNotNone(test_doc.related_event)
        self.assertTrue(test_doc.visible_to_user)

        resp = self.client.put(
            f"/{self.supporting_doc.id}", json={"associate_event": False, "assign_designation": False}
        )

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.json(), {"message": f"Supporting Document {test_doc.document_title} updated.", "success": True}
        )

        # Refresh from database and event and designation were updated
        test_doc.refresh_from_db()
        self.assertIsNone(test_doc.related_event)
        self.assertIsNone(test_doc.related_designation)

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_full_update(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        test_doc = SupportingDocument.objects.get(id=self.supporting_doc.id)

        # Verify initial state
        self.assertEqual(test_doc.document_type.id, self.doc_type_orders.id)
        self.assertIsNotNone(test_doc.related_event)
        self.assertTrue(test_doc.visible_to_user)

        resp = self.client.put(f"/{self.supporting_doc.id}", json=self.request_data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.json(),
            {"message": f"Supporting Document {self.request_data['document_title']} updated.", "success": True},
        )

        # Refresh from database and verify all fields were updated
        test_doc.refresh_from_db()
        self.assertEqual(test_doc.document_type.type, self.doc_type_award.type)
        self.assertEqual(test_doc.related_event.id, self.related_event_2.id)
        self.assertFalse(test_doc.visible_to_user)
        self.assertEqual(test_doc.document_title, self.request_data["document_title"])
        self.assertEqual(test_doc.document_title, self.request_data["document_title"])
        self.assertEqual(test_doc.document_title, self.request_data["document_title"])
        self.assertEqual(test_doc.related_designation.id, self.soldier_designation_2.id)
