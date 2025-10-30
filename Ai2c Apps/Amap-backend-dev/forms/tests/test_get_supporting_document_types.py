from http import HTTPStatus

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.supporting_documents.routes import router
from forms.models import SupportingDocumentType
from utils.tests import create_single_supporting_document_type


class GetSupportingDocumentTypes(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.document_type1 = create_single_supporting_document_type("Orders")
        self.document_type2 = create_single_supporting_document_type("Certificate")
        self.document_type3 = create_single_supporting_document_type("Training Record")

    def test_get_all_document_types(self):
        resp = self.client.get("/types")

        self.assertEqual(resp.status_code, HTTPStatus.OK)

        data = resp.json()
        self.assertEqual(len(data), 3)

        document_types = [doc_type["type"] for doc_type in data]
        self.assertIn("Orders", document_types)
        self.assertIn("Certificate", document_types)
        self.assertIn("Training Record", document_types)

        first_type = next(doc_type for doc_type in data if doc_type["type"] == "Orders")
        self.assertIn("id", first_type)
        self.assertEqual(first_type["type"], "Orders")

    def test_get_empty_document_types(self):
        SupportingDocumentType.objects.all().delete()

        resp = self.client.get("/types")

        self.assertEqual(resp.status_code, HTTPStatus.OK)

        data = resp.json()
        self.assertEqual(len(data), 0)
        self.assertEqual(data, [])
