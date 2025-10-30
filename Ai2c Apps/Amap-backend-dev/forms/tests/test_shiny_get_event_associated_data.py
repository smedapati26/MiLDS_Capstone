import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from forms.models import DA_4856, Event, SupportingDocument
from utils.http.constants import HTTP_404_DA7817_DOES_NOT_EXIST
from utils.tests import (
    create_single_supporting_document_type,
    create_single_test_event,
    create_single_test_supporting_document,
    create_test_4856,
    create_test_4856_pdf,
    create_test_soldier,
    create_testing_unit,
)


@tag("forms", "event", "shiny_get_event_associated_data")
class TestShinyGet7817AssociatedData(TestCase):
    def setUp(self):
        self.unit = create_testing_unit()

        self.soldier = create_test_soldier(unit=self.unit)

        self.event = create_single_test_event(soldier=self.soldier, recorded_by=self.soldier, uic=self.unit)

        self.test_doc = create_test_4856_pdf()

        self.counseling = create_test_4856(soldier=self.soldier, document=self.test_doc)

        self.supporting_document_type = create_single_supporting_document_type("Test")

        self.supporting_document = create_single_test_supporting_document(
            soldier=self.soldier, document_type=self.supporting_document_type
        )

    def test_invalid_7817_id(self):
        # Make the request
        resp = self.client.get(reverse("shiny_event_assoc_docs", kwargs={"event_id": 51198}))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_DA7817_DOES_NOT_EXIST)

    def test_valid_no_associated_data(self):
        # Make the request
        resp = self.client.get(reverse("shiny_event_assoc_docs", kwargs={"event_id": self.event.id}))

        # Set up the expected and actual data
        expected_data = {"associated_counselings": [], "associated_supporting_docs": []}
        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_valid_only_associated_couseling(self):
        # Update the event data
        self.event.attached_da_4856 = self.counseling
        self.event.save()

        # Make the request
        resp = self.client.get(reverse("shiny_event_assoc_docs", kwargs={"event_id": self.event.id}))

        # Set up the expected and actual data
        expected_data = {
            "associated_counselings": {"id": self.counseling.id, "title": self.counseling.title},
            "associated_supporting_docs": [],
        }
        acual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(acual_data, expected_data)

    def test_valid_only_associated_supporting_document(self):
        # Update the event data
        self.supporting_document.related_event = self.event
        self.supporting_document.save()

        # Make the request
        resp = self.client.get(reverse("shiny_event_assoc_docs", kwargs={"event_id": self.event.id}))

        # Set up the expected and actual data
        expected_data = {
            "associated_counselings": [],
            "associated_supporting_docs": [
                {
                    "id": self.supporting_document.id,
                    "type": self.supporting_document.document_type.type,
                    "title": self.supporting_document.document_title,
                }
            ],
        }
        acual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(acual_data, expected_data)

    def test_valid_multiple_associated_data(self):
        # Create a second supporting document
        supporting_document_2 = create_single_test_supporting_document(
            soldier=self.soldier, document_type=self.supporting_document_type, document_title="Newer Doc", id=2
        )

        # Update the event data
        self.supporting_document.related_event = self.event
        self.supporting_document.save()

        supporting_document_2.related_event = self.event
        supporting_document_2.save()

        self.event.attached_da_4856 = self.counseling
        self.event.save()

        # Make the request
        resp = self.client.get(reverse("shiny_event_assoc_docs", kwargs={"event_id": self.event.id}))

        # Set up the expected and actual data
        expected_data = {
            "associated_counselings": {"id": self.counseling.id, "title": self.counseling.title},
            "associated_supporting_docs": [
                {
                    "id": self.supporting_document.id,
                    "type": self.supporting_document.document_type.type,
                    "title": self.supporting_document.document_title,
                },
                {
                    "id": supporting_document_2.id,
                    "type": supporting_document_2.document_type.type,
                    "title": supporting_document_2.document_title,
                },
            ],
        }

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
