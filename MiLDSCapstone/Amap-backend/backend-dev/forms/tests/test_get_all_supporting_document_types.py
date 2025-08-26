from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from utils.tests import create_single_supporting_document_type


@tag("supporting_document_type")
class TestGetAllSupportingDocumentTypes(TestCase):
    def setUp(self):
        self.doc_type_1 = create_single_supporting_document_type("Type 1")
        self.doc_type_2 = create_single_supporting_document_type("Type 2")
        self.doc_type_3 = create_single_supporting_document_type("Type 3")

    def test_with_no_doc_types(self):
        # Remove existing data
        self.doc_type_1.delete()
        self.doc_type_2.delete()
        self.doc_type_3.delete()

        # Make the api call
        resp = self.client.get(reverse("get_all_supporting_document_types"))

        # Set up the expected data and actual data
        expected_data = {"supporting_document_types": []}
        actual_data = json.loads(resp.content.decode("utf-8"))

        # Verify expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_with_single_doc_types(self):
        # Remove existing data
        self.doc_type_1.delete()

        # Make the api call
        resp = self.client.get(reverse("get_all_supporting_document_types"))

        # Set up the expected data and actual data
        expected_data = {"supporting_document_types": [self.doc_type_1.type]}
        actual_data = json.loads(resp.content.decode("utf-8"))

        # Verify expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_with_multiple_doc_types(self):
        # Make the api call
        resp = self.client.get(reverse("get_all_supporting_document_types"))

        # Set up the expected data and actual data
        expected_data = {
            "supporting_document_types": [self.doc_type_1.type, self.doc_type_2.type, self.doc_type_3.type]
        }
        actual_data = json.loads(resp.content.decode("utf-8"))

        # Verify expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
