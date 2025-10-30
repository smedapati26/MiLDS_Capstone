from datetime import date
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.events.routes import router
from forms.models import DA_4856, SupportingDocument, SupportingDocumentType
from personnel.model_utils import MaintenanceLevel, Rank
from utils.tests import (
    create_single_test_event,
    create_test_mos_code,
    create_test_soldier,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("GetEventDocuments")
class TestGetEventDocuments(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("forms.api.events.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit(uic="TEST001", short_name="Test Unit", display_name="Test Unit Display")
        self.mos = create_test_mos_code(mos="15T", mos_description="Test MOS")
        self.soldier = create_test_soldier(unit=self.unit, user_id="1234567890", rank=Rank.SGT, primary_mos=self.mos)

        self.event = create_single_test_event(
            soldier=self.soldier,
            recorded_by=self.soldier,
            uic=self.unit,
            id=1,
            date_time=date(2024, 1, 15),
            maintenance_level=MaintenanceLevel.ML2,
        )

        self.get_user_id.return_value = self.soldier.user_id

        create_user_role_in_all(soldier=self.soldier, units=[self.unit])

    def test_get_event_documents_no_documents(self):
        """Test endpoint returns empty list when event has no documents"""
        response = self.client.get(f"/events/{self.event.id}/documents")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_get_event_documents_with_da_4856(self):
        """Test endpoint returns DA 4856 when attached to event"""
        da_4856 = DA_4856.objects.create(
            date=date(2024, 1, 15),
            soldier=self.soldier,
            title="Test Counseling",
            document="test_file.pdf",
        )

        self.event.attached_da_4856 = da_4856
        self.event.save()

        response = self.client.get(f"/events/{self.event.id}/documents")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], da_4856.id)
        self.assertEqual(data[0]["title"], "Test Counseling")
        self.assertEqual(data[0]["file_path"], "test_file.pdf")
        self.assertEqual(data[0]["type"], "DA_4856")

    def test_get_event_documents_with_supporting_document(self):
        """Test endpoint returns supporting documents"""
        doc_type = SupportingDocumentType.objects.create(type="Certificate")

        supporting_doc = SupportingDocument.objects.create(
            soldier=self.soldier,
            upload_date=date(2024, 1, 15),
            document_date=date(2024, 1, 15),
            document_title="Training Certificate",
            document="certificate.pdf",
            document_type=doc_type,
            related_event=self.event,
            visible_to_user=True,
        )

        response = self.client.get(f"/events/{self.event.id}/documents")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], supporting_doc.id)
        self.assertEqual(data[0]["title"], "Training Certificate")
        self.assertEqual(data[0]["file_path"], "certificate.pdf")
        self.assertEqual(data[0]["type"], "SupportingDocument")

    def test_get_event_documents_with_both_types(self):
        """Test endpoint returns both DA 4856 and supporting documents"""
        da_4856 = DA_4856.objects.create(
            date=date(2024, 1, 15), soldier=self.soldier, title="Test Counseling", document="counseling.pdf"
        )
        self.event.attached_da_4856 = da_4856
        self.event.save()

        doc_type = SupportingDocumentType.objects.create(type="Certificate")
        supporting_doc = SupportingDocument.objects.create(
            soldier=self.soldier,
            upload_date=date(2024, 1, 15),
            document_date=date(2024, 1, 15),
            document_title="Training Certificate",
            document="certificate.pdf",
            document_type=doc_type,
            related_event=self.event,
            visible_to_user=True,
        )

        response = self.client.get(f"/events/{self.event.id}/documents")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

        doc_types = [doc["type"] for doc in data]
        self.assertIn("DA_4856", doc_types)
        self.assertIn("SupportingDocument", doc_types)

    def test_get_event_documents_excludes_invisible_supporting_docs(self):
        """Test endpoint excludes supporting documents marked as invisible"""
        doc_type = SupportingDocumentType.objects.create(type="Certificate")

        SupportingDocument.objects.create(
            soldier=self.soldier,
            upload_date=date(2024, 1, 15),
            document_date=date(2024, 1, 15),
            document_title="Hidden Document",
            document="hidden.pdf",
            document_type=doc_type,
            related_event=self.event,
            visible_to_user=False,
        )
        response = self.client.get(f"/events/{self.event.id}/documents")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_get_event_documents_excludes_docs_without_files(self):
        """Test endpoint excludes documents without actual files"""
        doc_type = SupportingDocumentType.objects.create(type="Certificate")

        SupportingDocument.objects.create(
            soldier=self.soldier,
            upload_date=date(2024, 1, 15),
            document_date=date(2024, 1, 15),
            document_title="No File Document",
            document="",
            document_type=doc_type,
            related_event=self.event,
            visible_to_user=True,
        )
        response = self.client.get(f"/events/{self.event.id}/documents")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_get_event_documents_invalid_event_id(self):
        """Test endpoint returns 404 for invalid event ID"""
        response = self.client.get("/events/99999/documents")
        self.assertEqual(response.status_code, 404)
