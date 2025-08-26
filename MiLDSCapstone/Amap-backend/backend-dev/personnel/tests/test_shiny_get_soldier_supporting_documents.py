from django.test import TestCase, tag
from django.urls import reverse
import json
from http import HTTPStatus

from utils.tests import (
    create_test_soldier,
    create_single_supporting_document_type,
    create_single_test_supporting_document,
    create_test_unit,
    create_test_4856_pdf,
    create_single_test_event,
)
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST


@tag("shiny_soldier_get_supporting_documents")
class ShinyGetSoldierSupportingDocuments(TestCase):
    def setUp(self):
        self.unit = create_test_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.soldier_2 = create_test_soldier(unit=self.unit, user_id="51198")
        self.da4856_pdf = create_test_4856_pdf()
        self.supporting_document_type_1 = create_single_supporting_document_type("Award")
        self.supporting_document_type_2 = create_single_supporting_document_type("Orders")
        self.event = create_single_test_event(soldier=self.soldier, recorded_by=self.soldier_2, uic=self.unit)
        self.supporting_document_1 = create_single_test_supporting_document(
            soldier=self.soldier,
            document_type=self.supporting_document_type_1,
            uploaded_by=self.soldier_2,
            document=self.da4856_pdf,
            related_event=self.event,
            id=1,
        )
        self.supporting_document_2 = create_single_test_supporting_document(
            soldier=self.soldier,
            document_type=self.supporting_document_type_2,
            document_title="Second Supporting Doc",
            id=2,
        )

        self.request_url = reverse(
            "personnel:shiny_get_soldier_supporting_documents", kwargs={"user_id": self.soldier.user_id}
        )

    @tag("invalid_soldier_id")
    def test_invalid_soldier_id(self):
        # Update the request
        request_url = reverse("personnel:shiny_get_soldier_supporting_documents", kwargs={"user_id": "899115"})

        # Make the request
        resp = self.client.get(request_url)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("valid")
    def test_valid(self):
        # Make the request
        resp = self.client.get(self.request_url)

        # Set up the expected and actual data
        actual_data = json.loads(resp.content)
        expected_data = {
            "supporting_documents": [
                {
                    "id": self.supporting_document_1.id,
                    "uploaded_by": self.soldier_2.name_and_rank(),
                    "upload_date": self.supporting_document_1.upload_date,
                    "document": self.supporting_document_1.document == None,
                    "document_date": self.supporting_document_1.document_date,
                    "document_title": self.supporting_document_1.document_title,
                    "document_type": self.supporting_document_type_1.type,
                    "related_event": self.event.id,
                    "visible_to_user": self.supporting_document_1.visible_to_user,
                },
                {
                    "id": self.supporting_document_2.id,
                    "uploaded_by": None,
                    "upload_date": self.supporting_document_2.upload_date,
                    "document": self.supporting_document_2.document == None,
                    "document_date": self.supporting_document_2.document_date,
                    "document_title": self.supporting_document_2.document_title,
                    "document_type": self.supporting_document_type_2.type,
                    "related_event": None,
                    "visible_to_user": self.supporting_document_1.visible_to_user,
                },
            ]
        }
        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
