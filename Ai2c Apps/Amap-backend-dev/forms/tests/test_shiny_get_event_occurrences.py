import json
from datetime import date
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from forms.model_utils import EvaluationResult
from forms.model_utils import EventType as OldEventType
from forms.model_utils import TrainingType as OldTrainingType
from forms.models import Event, EventTasks
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)
from utils.tests import (
    create_single_test_event,
    create_test_event_task,
    create_test_event_type,
    create_test_soldier,
    create_test_task,
    create_test_training_type,
    create_testing_unit,
)


@tag("forms", "da_7817", "get_shiny_event_occurrences")
class GetShinyEventoccurrencesTests(TestCase):
    def setUp(self):
        self.unit = create_testing_unit()
        self.soldier_1 = create_test_soldier(unit=self.unit)
        self.soldier_2 = create_test_soldier(unit=self.unit, user_id="0123456789", first_name="Second")

        self.soldier_1_eval_1: Event = create_single_test_event(
            soldier=self.soldier_1, recorded_by=self.soldier_2, uic=self.unit
        )
        self.soldier_1_eval_2: Event = create_single_test_event(
            soldier=self.soldier_1,
            recorded_by=self.soldier_2,
            uic=self.unit,
            id=2,
            date_time=date(2023, 11, 12),
            go_nogo=EvaluationResult.NOGO,
        )

        self.soldier_1_train_1: Event = create_single_test_event(
            soldier=self.soldier_1,
            recorded_by=self.soldier_2,
            uic=self.unit,
            event_type=create_test_event_type(event_type=OldEventType.Training.value),
            training_type=create_test_training_type(OldTrainingType.Corrosion.value),
            id=3,
            date_time=date(2023, 9, 12),
        )

        self.soldier_1_train_2: Event = create_single_test_event(
            soldier=self.soldier_1,
            recorded_by=self.soldier_2,
            uic=self.unit,
            event_type=create_test_event_type(event_type=OldEventType.Training.value),
            training_type=create_test_training_type(OldTrainingType.Corrosion.value),
            id=4,
            date_time=date(2024, 4, 10),
        )

        self.task_1 = create_test_task()

        self.soldier_1_task_1: EventTasks = create_test_event_task(event=self.soldier_1_eval_1, task=self.task_1)
        self.soldier_1_task_2: EventTasks = create_test_event_task(id=2, event=self.soldier_1_train_1, task=self.task_1)

        self.request_data = {
            "soldier_id": self.soldier_1.user_id,
            "event_info": self.soldier_1_eval_1.evaluation_type.type,
        }

        self.request_headers = {"X-On-Behalf-Of": self.soldier_1.user_id}

        self.request_url = reverse("get_event_occurrences")

    def test_missing_soldier_id(self):
        # Update the request data
        self.request_data.pop("soldier_id")

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            data=json.dumps(self.request_data),
            content_type="content/json",
            headers=self.request_headers,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_invalid_soldier_id(self):
        # Update the request data
        self.request_data["soldier_id"] = "INVALID"

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            data=json.dumps(self.request_data),
            content_type="content/json",
            headers=self.request_headers,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    def test_valid_eval_request(self):
        # Make the request
        resp = self.client.post(
            path=self.request_url,
            data=json.dumps(self.request_data),
            content_type="content/json",
            headers=self.request_headers,
        )

        # Set up the expected and actual data
        expected_data = [
            {
                "event_type": self.soldier_1_eval_1.event_type.type,
                "event_info": self.soldier_1_eval_1.evaluation_type.type,
                "date": self.soldier_1_eval_1.date.isoformat(),
                "result": self.soldier_1_eval_1.go_nogo,
            },
            {
                "event_type": self.soldier_1_eval_2.event_type.type,
                "event_info": self.soldier_1_eval_2.evaluation_type.type,
                "date": self.soldier_1_eval_2.date.isoformat(),
                "result": self.soldier_1_eval_2.go_nogo,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_valid_training_request(self):
        # Update the request data
        self.request_data["event_info"] = self.soldier_1_train_1.training_type.type

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            data=json.dumps(self.request_data),
            content_type="content/json",
            headers=self.request_headers,
        )

        # Set up the expected and actual data
        expected_data = [
            {
                "event_type": self.soldier_1_train_1.event_type.type,
                "event_info": self.soldier_1_train_1.training_type.type,
                "date": self.soldier_1_train_1.date.isoformat(),
                "result": self.soldier_1_train_1.go_nogo,
            },
            {
                "event_type": self.soldier_1_train_2.event_type.type,
                "event_info": self.soldier_1_train_2.training_type.type,
                "date": self.soldier_1_train_2.date.isoformat(),
                "result": self.soldier_1_train_2.go_nogo,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_valid_task_request(self):
        # Update the request data
        self.request_data["event_info"] = self.soldier_1_task_1.task.task_number

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            data=json.dumps(self.request_data),
            content_type="content/json",
            headers=self.request_headers,
        )

        # Set up the expected and actual data
        expected_data = [
            {
                "event_type": self.soldier_1_task_1.event.event_type.type,
                "event_info": self.soldier_1_task_1.task.task_number + " - " + self.soldier_1_task_1.task.task_title,
                "date": self.soldier_1_task_1.event.date.isoformat(),
                "result": self.soldier_1_task_1.event.go_nogo,
            },
            {
                "event_type": self.soldier_1_task_2.event.event_type.type,
                "event_info": self.soldier_1_task_2.task.task_number + " - " + self.soldier_1_task_2.task.task_title,
                "date": self.soldier_1_task_2.event.date.isoformat(),
                "result": self.soldier_1_task_2.event.go_nogo,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
