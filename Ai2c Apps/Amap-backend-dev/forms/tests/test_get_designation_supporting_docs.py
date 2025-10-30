from datetime import date
from unittest.mock import patch

from django.test import TestCase, tag
from django.utils import timezone
from ninja.testing import TestClient

from forms.api.supporting_documents.routes import router
from forms.models import SupportingDocument, SupportingDocumentType
from personnel.models import Designation, Soldier, SoldierDesignation, Unit
from utils.tests import create_user_role_in_all


@tag("DesignationSupportingDocs")
class TestDesignationSupportingDocEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("forms.api.supporting_documents.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.unit = Unit.objects.create(
            uic="TEST123", short_name="Test Unit", display_name="Test Unit Display", level=0, as_of_logical_time=0
        )

        self.soldier = Soldier.objects.create(
            user_id="1234567890", rank="SGT", first_name="Test", last_name="User", unit=self.unit
        )
        self.designation_type = Designation.objects.create(type="Test Designation", description="Test Description")

        self.designation = SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation_type,
            unit=self.unit,
            start_date=timezone.now(),
            designation_removed=False,
        )

        self.doc_type = SupportingDocumentType.objects.create(type="Test Document Type")

        today = timezone.now().date()
        self.supporting_doc = SupportingDocument.objects.create(
            soldier=self.soldier,
            upload_date=today,
            document_date=today,
            document_title="Test Document",
            document_type=self.doc_type,
            related_designation=self.designation,
            visible_to_user=True,
        )

        self.hidden_doc = SupportingDocument.objects.create(
            soldier=self.soldier,
            upload_date=today,
            document_date=today,
            document_title="Hidden Document",
            document_type=self.doc_type,
            related_designation=self.designation,
            visible_to_user=False,
        )

        self.get_user_id.return_value = self.soldier.user_id

        create_user_role_in_all(soldier=self.soldier, units=[self.unit])

    def test_get_designation_supporting_docs(self):
        response = self.client.get(f"/{self.designation.id}/supporting-docs")

        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("associated_supporting_docs", data)
        self.assertEqual(len(data["associated_supporting_docs"]), 1)

        doc = data["associated_supporting_docs"][0]
        self.assertEqual(doc["id"], self.supporting_doc.id)
        self.assertEqual(doc["document_type"], self.doc_type.type)
        self.assertEqual(doc["document_title"], "Test Document")

        hidden_ids = [doc["id"] for doc in data["associated_supporting_docs"]]
        self.assertNotIn(self.hidden_doc.id, hidden_ids)

    def test_designation_not_found(self):
        response = self.client.get("/99999/supporting-docs")

        self.assertEqual(response.status_code, 404)
