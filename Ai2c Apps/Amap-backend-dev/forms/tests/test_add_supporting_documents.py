from datetime import date
from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase
from ninja.testing import TestClient

from forms.api.supporting_documents.routes import router
from forms.models import SupportingDocument
from utils.tests import (
    create_single_supporting_document_type,
    create_single_test_event,
    create_test_4856_pdf,
    create_test_designation,
    create_test_soldier,
    create_test_soldier_designation,
    create_testing_unit,
)


class TestAddSupportingDocument(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="51198")
        self.document_date = date.today().isoformat()
        self.document = create_test_4856_pdf()
        self.document_type = create_single_supporting_document_type("Orders")
        self.document_type_award = create_single_supporting_document_type("Award")
        self.related_event = create_single_test_event(
            soldier=self.soldier, recorded_by=self.uploading_soldier, uic=self.unit
        )
        self.related_designation = create_test_soldier_designation(
            soldier=self.soldier, designation=create_test_designation()
        )
        self.form_data = {
            "document_title": "DA4856_BLANK",
            "document_type": self.document_type.type,
            "document_date": self.document_date,
            "related_event_id": self.related_event.id,
            "related_designation_id": "None",
        }

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_invalid_soldier_id(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        resp = self.client.post("/soldier/INVALID", data=self.form_data, FILES={"file": self.document})

        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_invalid_event_id(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        form_data = self.form_data.copy()
        form_data["related_event_id"] = 99999
        resp = self.client.post(f"/soldier/{self.soldier.user_id}", data=form_data, FILES={"file": self.document})

        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_invalid_supporting_document_type(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        form_data = self.form_data.copy()
        form_data["document_type"] = "INVALID"
        resp = self.client.post(f"/soldier/{self.soldier.user_id}", data=form_data, FILES={"file": self.document})

        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_missing_file(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        resp = self.client.post(
            f"/soldier/{self.soldier.user_id}",
            data=self.form_data,
            # No file parameter
        )

        self.assertEqual(resp.status_code, HTTPStatus.UNPROCESSABLE_ENTITY)
        self.assertTrue("file" in resp.json().get("detail", [])[0].get("loc", []))

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_valid_no_event(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        form_data = self.form_data.copy()
        form_data["related_event_id"] = "None"

        initial_count = SupportingDocument.objects.count()

        resp = self.client.post(f"/soldier/{self.soldier.user_id}", data=form_data, FILES={"file": self.document})

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(SupportingDocument.objects.count(), initial_count + 1)

        new_doc = SupportingDocument.objects.latest("id")

        self.assertEqual(new_doc.document_title, "DA4856_BLANK")
        self.assertEqual(new_doc.related_event, None)
        self.assertEqual(new_doc.document_type.type, self.document_type.type)
        self.assertEqual(
            resp.json(),
            {"message": f"Supporting Document {new_doc.document_title} created successfully.", "success": True},
        )

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_valid_with_event(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        initial_count = SupportingDocument.objects.count()

        resp = self.client.post(f"/soldier/{self.soldier.user_id}", data=self.form_data, FILES={"file": self.document})

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(SupportingDocument.objects.count(), initial_count + 1)

        new_doc = SupportingDocument.objects.latest("id")

        self.assertEqual(new_doc.document_title, "DA4856_BLANK")
        self.assertEqual(new_doc.related_event.id, self.related_event.id)
        self.assertEqual(
            resp.json(),
            {"message": f"Supporting Document {new_doc.document_title} created successfully.", "success": True},
        )

    @patch("forms.api.supporting_documents.routes.get_user_id")
    def test_valid_with_designation(self, mock_get_user_id):
        mock_get_user_id.return_value = self.uploading_soldier.user_id

        form_data = self.form_data.copy()
        form_data["related_event_id"] = "None"
        form_data["related_designation_id"] = self.related_designation.id

        initial_count = SupportingDocument.objects.count()

        resp = self.client.post(f"/soldier/{self.soldier.user_id}", data=form_data, FILES={"file": self.document})

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(SupportingDocument.objects.count(), initial_count + 1)

        new_doc = SupportingDocument.objects.latest("id")

        self.assertEqual(new_doc.document_title, "DA4856_BLANK")
        self.assertEqual(new_doc.related_designation.id, self.related_designation.id)
        self.assertEqual(
            resp.json(),
            {"message": f"Supporting Document {new_doc.document_title} created successfully.", "success": True},
        )
