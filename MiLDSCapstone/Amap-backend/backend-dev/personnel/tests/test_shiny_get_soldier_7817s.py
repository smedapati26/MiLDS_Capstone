from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from forms.models import DA_7817
from utils.tests import (
    create_test_unit,
    create_single_test_event,
    create_test_soldier,
    create_test_event_task,
    create_test_task,
)

from utils.http.constants import CONTENT_TYPE_JSON, HTTP_SUCCESS_STATUS_CODE, HTTP_404_SOLDIER_DOES_NOT_EXIST


@tag("personnel", "get_soldier_da7817s")
class GetSoldierDA7817s(TestCase):
    get_soldier_7817s = "personnel:shiny_get_soldier_da_7817s"

    # Initial setup for the get soldier 7817 endpoint functionality
    def setUp(self) -> None:
        self.unit = create_test_unit()
        # Create Soldier
        self.test_soldier = create_test_soldier(unit=self.unit)
        self.test_initial_recorder = create_test_soldier(unit=self.unit, user_id=1111111111)
        # Create DA7817 Event
        self.test_event = create_single_test_event(
            id=1, soldier=self.test_soldier, uic=self.unit, recorded_by=self.test_initial_recorder
        )
        self.test_deleted_event = create_single_test_event(
            id=2, soldier=self.test_soldier, uic=self.unit, recorded_by=self.test_initial_recorder, event_deleted=True
        )
        self.test_task = create_test_task()
        self.test_event_task = create_test_event_task(event=self.test_event, task=self.test_task)
        self.da_7817_fields = [
            "id",
            "soldier_id",
            "date",
            "uic_id",
            "event_type__type",
            "training_type__type",
            "evaluation_type__type",
            "go_nogo",
            "gaining_unit_id",
            "tcs_location__abbreviation",
            "award_type__type",
            "total_mx_hours",
            "comment",
            "maintenance_level",
            "recorded_by_legacy",
            "recorded_by_id",
            "recorded_by_non_legacy",
            "attached_da_4856_id",
            "event_tasks",
            "event_deleted",
            "has_associations",
            "mos__mos",
        ]

    @tag("validation")
    def test_get_soldier_da7817s_invalid_soldier(self):
        """
        Checks that a request for soldier_7817s with invalid soldier id returns not found error
        """
        url = reverse(self.get_soldier_7817s, kwargs={"user_id": "INVALID_SOLDIER"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_get_soldier_da7817s(self):
        """
        Checks that a valid request for soldier_7817s returns the correct JSON response
        """
        response = self.client.get(
            reverse(self.get_soldier_7817s, kwargs={"user_id": self.test_soldier.user_id}),
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.json()["da_7817s"]

        self.assertEqual(len(response_data), DA_7817.objects.count() - 1)
        self.assertSequenceEqual(set(response_data[0].keys()), set(self.da_7817_fields))
        self.assertEqual(response_data[0]["event_tasks"], [self.test_task.task_number])
        self.assertEqual(response_data[0]["has_associations"], False)
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

    @tag("validation")
    def test_get_soldier_da7817s_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.get_soldier_7817s, kwargs={"user_id": self.test_soldier.user_id})
        # PUT - FORBIDDEN
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # POST - FORBIDDEN
        response = self.client.post(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # DELETE - FORBIDDEN
        response = self.client.delete(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
