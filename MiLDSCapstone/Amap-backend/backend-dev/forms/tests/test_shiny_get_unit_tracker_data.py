from django.test import TestCase, tag
from django.urls import reverse
from datetime import date
from http import HTTPStatus
import json

from forms.models import DA_7817, EventTasks, EventType, TrainingType, EvaluationType
from forms.model_utils import (
    EventType as OldEventType,
    TrainingType as OldTrainingType,
    EvaluationType as OldEvaluationType,
    EvaluationResult,
)
from personnel.model_utils import Months

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_404_UNIT_DOES_NOT_EXIST,
)
from utils.tests import (
    create_test_soldier,
    create_test_unit,
    create_single_test_event,
    create_test_event_task,
    create_test_task,
    create_test_event_type,
    create_test_training_type,
    create_test_evaluation_type,
)


@tag("forms", "da_7817", "get_train_and_eval_tracking_data")
class GetTrainAndEvalTrackingDataTests(TestCase):
    def setUp(self):
        self.unit = create_test_unit()
        self.unit_2 = create_test_unit(uic="TEST000A0", parent_uic=self.unit)
        self.unit_3 = create_test_unit(uic="TEST001AA")

        self.unit.set_all_unit_lists()
        self.unit_2.set_all_unit_lists()
        self.unit_3.set_all_unit_lists()

        self.soldier_1 = create_test_soldier(unit=self.unit)
        self.soldier_2 = create_test_soldier(unit=self.unit, user_id="0123456789", first_name="Second")
        self.soldier_3 = create_test_soldier(
            unit=self.unit_2, user_id="9012345678", first_name="Third", birth_month=Months.MAY
        )

        self.soldier_1_event_1: DA_7817 = create_single_test_event(
            soldier=self.soldier_1, recorded_by=self.soldier_1, uic=self.unit
        )
        self.soldier_1_event_2: DA_7817 = create_single_test_event(
            soldier=self.soldier_1,
            recorded_by=self.soldier_1,
            uic=self.unit,
            id=2,
            date_time=date(2023, 1, 1),
            event_type=create_test_event_type(OldEventType.Training.value),
            training_type=create_test_training_type(OldTrainingType.Engine.value),
            evaluation_type=None,
        )
        self.soldier_3_event_1: DA_7817 = create_single_test_event(
            soldier=self.soldier_3,
            recorded_by=self.soldier_1,
            uic=self.unit_2,
            id=3,
            evaluation_type=create_test_evaluation_type(OldEvaluationType.CDR.value),
            go_nogo=EvaluationResult.NOGO,
        )

        self.task_1 = create_test_task()

        self.soldier_1_task_1: EventTasks = create_test_event_task(event=self.soldier_1_event_1, task=self.task_1)

        self.request_data = {
            "unit_uic": self.unit.uic,
            "events": ["Training", "Evaluation"],
            "event_types": [
                create_test_evaluation_type(OldEvaluationType.Annual.value).type,
                create_test_evaluation_type(OldEvaluationType.CDR.value).type,
                create_test_training_type(OldTrainingType.Engine.value).type,
            ],
            "start_date": self.soldier_1_event_2.date.isoformat(),
            "end_date": self.soldier_1_event_1.date.isoformat(),
            "birth_months": [Months.UNK, Months.MAY],
            "recent_vs_count": "recent",
        }

        self.request_headers = {"X-On-Behalf-Of": self.soldier_1.user_id}

        self.request_url = reverse("get_train_and_eval_tracking_data")

    def test_missing_unit_uic(self):
        # Update the request data
        self.request_data.pop("unit_uic")

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

    def test_invalid_unit_uic(self):
        # Update the request data
        self.request_data["unit_uic"] = "51198"

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            data=json.dumps(self.request_data),
            content_type="content/json",
            headers=self.request_headers,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    def test_unit_with_no_events(self):
        # Update the request data
        self.request_data["unit_uic"] = self.unit_3.uic

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            data=json.dumps(self.request_data),
            content_type="content/json",
            headers=self.request_headers,
        )

        # Set up the expected and actual data
        expected_data = []
        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_valid_basic_request(self):
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
                "DODID": self.soldier_1.user_id,
                "Soldier Name": self.soldier_1.name_and_rank(),
                "Unit": self.soldier_1.unit.short_name,
                "Birth Month": str(self.soldier_1.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): self.soldier_1_event_1.date.isoformat(),
                str(self.soldier_3_event_1.evaluation_type.type): None,
                str(self.soldier_1_event_2.training_type.type): self.soldier_1_event_2.date.isoformat(),
            },
            {
                "DODID": self.soldier_2.user_id,
                "Soldier Name": self.soldier_2.name_and_rank(),
                "Unit": self.soldier_2.unit.short_name,
                "Birth Month": str(self.soldier_2.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): None,
                str(self.soldier_3_event_1.evaluation_type.type): None,
                str(self.soldier_1_event_2.training_type.type): None,
            },
            {
                "DODID": self.soldier_3.user_id,
                "Soldier Name": self.soldier_3.name_and_rank(),
                "Unit": self.soldier_3.unit.short_name,
                "Birth Month": str(self.soldier_3.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): None,
                str(self.soldier_3_event_1.evaluation_type.type): "No-Go",
                str(self.soldier_1_event_2.training_type.type): None,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_event_filter_with_evaluation(self):
        # Update the request data
        self.request_data["events"] = "Evaluation"
        self.request_data["event_types"] = [
            create_test_evaluation_type(OldEvaluationType.Annual.value).type,
            create_test_evaluation_type(OldEvaluationType.CDR.value).type,
        ]

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
                "DODID": self.soldier_1.user_id,
                "Soldier Name": self.soldier_1.name_and_rank(),
                "Unit": self.soldier_1.unit.short_name,
                "Birth Month": str(self.soldier_1.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): self.soldier_1_event_1.date.isoformat(),
                str(self.soldier_3_event_1.evaluation_type.type): None,
            },
            {
                "DODID": self.soldier_2.user_id,
                "Soldier Name": self.soldier_2.name_and_rank(),
                "Unit": self.soldier_2.unit.short_name,
                "Birth Month": str(self.soldier_2.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): None,
                str(self.soldier_3_event_1.evaluation_type.type): None,
            },
            {
                "DODID": self.soldier_3.user_id,
                "Soldier Name": self.soldier_3.name_and_rank(),
                "Unit": self.soldier_3.unit.short_name,
                "Birth Month": str(self.soldier_3.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): None,
                str(self.soldier_3_event_1.evaluation_type.type): "No-Go",
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_desired_event_filter_with_training(self):
        # Update the request data
        self.request_data["events"] = "Training"
        self.request_data["event_types"] = [create_test_training_type(OldTrainingType.Engine.value).type]

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
                "DODID": self.soldier_1.user_id,
                "Soldier Name": self.soldier_1.name_and_rank(),
                "Unit": self.soldier_1.unit.short_name,
                "Birth Month": str(self.soldier_1.birth_month),
                str(self.soldier_1_event_2.training_type.type): self.soldier_1_event_2.date.isoformat(),
            },
            {
                "DODID": self.soldier_2.user_id,
                "Soldier Name": self.soldier_2.name_and_rank(),
                "Unit": self.soldier_2.unit.short_name,
                "Birth Month": str(self.soldier_2.birth_month),
                str(self.soldier_1_event_2.training_type.type): None,
            },
            {
                "DODID": self.soldier_3.user_id,
                "Soldier Name": self.soldier_3.name_and_rank(),
                "Unit": self.soldier_3.unit.short_name,
                "Birth Month": str(self.soldier_3.birth_month),
                str(self.soldier_1_event_2.training_type.type): None,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_event_types_filter_with_only_evaluation_type(self):
        # Update the request data
        self.request_data["event_types"] = str(self.soldier_1_event_1.evaluation_type.type)

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
                "DODID": self.soldier_1.user_id,
                "Soldier Name": self.soldier_1.name_and_rank(),
                "Unit": self.soldier_1.unit.short_name,
                "Birth Month": str(self.soldier_1.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): self.soldier_1_event_1.date.isoformat(),
            },
            {
                "DODID": self.soldier_2.user_id,
                "Soldier Name": self.soldier_2.name_and_rank(),
                "Unit": self.soldier_2.unit.short_name,
                "Birth Month": str(self.soldier_2.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): None,
            },
            {
                "DODID": self.soldier_3.user_id,
                "Soldier Name": self.soldier_3.name_and_rank(),
                "Unit": self.soldier_3.unit.short_name,
                "Birth Month": str(self.soldier_3.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): None,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_event_type_filter_with_only_training_type(self):
        # Update the request data
        self.request_data["event_types"] = str(self.soldier_1_event_2.training_type.type)

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
                "DODID": self.soldier_1.user_id,
                "Soldier Name": self.soldier_1.name_and_rank(),
                "Unit": self.soldier_1.unit.short_name,
                "Birth Month": str(self.soldier_1.birth_month),
                str(self.soldier_1_event_2.training_type.type): self.soldier_1_event_2.date.isoformat(),
            },
            {
                "DODID": self.soldier_2.user_id,
                "Soldier Name": self.soldier_2.name_and_rank(),
                "Unit": self.soldier_2.unit.short_name,
                "Birth Month": str(self.soldier_2.birth_month),
                str(self.soldier_1_event_2.training_type.type): None,
            },
            {
                "DODID": self.soldier_3.user_id,
                "Soldier Name": self.soldier_3.name_and_rank(),
                "Unit": self.soldier_3.unit.short_name,
                "Birth Month": str(self.soldier_3.birth_month),
                str(self.soldier_1_event_2.training_type.type): None,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_birth_month_filter(self):
        # Update the request data
        self.request_data["birth_months"] = str(Months.MAY)

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
                "DODID": self.soldier_3.user_id,
                "Soldier Name": self.soldier_3.name_and_rank(),
                "Unit": self.soldier_3.unit.short_name,
                "Birth Month": str(self.soldier_3.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): None,
                str(self.soldier_3_event_1.evaluation_type.type): "No-Go",
                str(self.soldier_1_event_2.training_type.type): None,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_date_range_filter(self):
        # Update the request data
        self.request_data["start_date"] = str(self.soldier_1_event_1.date)
        self.request_data["end_date"] = str(date.today())

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
                "DODID": self.soldier_1.user_id,
                "Soldier Name": self.soldier_1.name_and_rank(),
                "Unit": self.soldier_1.unit.short_name,
                "Birth Month": str(self.soldier_1.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): self.soldier_1_event_1.date.isoformat(),
                str(self.soldier_3_event_1.evaluation_type.type): None,
                str(self.soldier_1_event_2.training_type.type): None,
            },
            {
                "DODID": self.soldier_2.user_id,
                "Soldier Name": self.soldier_2.name_and_rank(),
                "Unit": self.soldier_2.unit.short_name,
                "Birth Month": str(self.soldier_2.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): None,
                str(self.soldier_3_event_1.evaluation_type.type): None,
                str(self.soldier_1_event_2.training_type.type): None,
            },
            {
                "DODID": self.soldier_3.user_id,
                "Soldier Name": self.soldier_3.name_and_rank(),
                "Unit": self.soldier_3.unit.short_name,
                "Birth Month": str(self.soldier_3.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): None,
                str(self.soldier_3_event_1.evaluation_type.type): "No-Go",
                str(self.soldier_1_event_2.training_type.type): None,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_task_completion_filter(self):
        # Update the request data
        self.request_data["events"] = "Tasks"
        self.request_data["event_types"] = [self.task_1.task_number]

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
                "DODID": self.soldier_1.user_id,
                "Soldier Name": self.soldier_1.name_and_rank(),
                "Unit": self.soldier_1.unit.short_name,
                "Birth Month": str(self.soldier_1.birth_month),
                str(self.task_1.task_number): self.soldier_3_event_1.date.isoformat(),
            },
            {
                "DODID": self.soldier_2.user_id,
                "Soldier Name": self.soldier_2.name_and_rank(),
                "Unit": self.soldier_2.unit.short_name,
                "Birth Month": str(self.soldier_2.birth_month),
                str(self.task_1.task_number): None,
            },
            {
                "DODID": self.soldier_3.user_id,
                "Soldier Name": self.soldier_3.name_and_rank(),
                "Unit": self.soldier_3.unit.short_name,
                "Birth Month": str(self.soldier_3.birth_month),
                str(self.task_1.task_number): None,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_eval_counts(self):
        self.request_data["recent_vs_count"] = "count"

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
                "DODID": self.soldier_1.user_id,
                "Soldier Name": self.soldier_1.name_and_rank(),
                "Unit": self.soldier_1.unit.short_name,
                "Birth Month": str(self.soldier_1.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): 1,
                str(self.soldier_3_event_1.evaluation_type.type): 0,
                str(self.soldier_1_event_2.training_type.type): 1,
            },
            {
                "DODID": self.soldier_2.user_id,
                "Soldier Name": self.soldier_2.name_and_rank(),
                "Unit": self.soldier_2.unit.short_name,
                "Birth Month": str(self.soldier_2.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): 0,
                str(self.soldier_3_event_1.evaluation_type.type): 0,
                str(self.soldier_1_event_2.training_type.type): 0,
            },
            {
                "DODID": self.soldier_3.user_id,
                "Soldier Name": self.soldier_3.name_and_rank(),
                "Unit": self.soldier_3.unit.short_name,
                "Birth Month": str(self.soldier_3.birth_month),
                str(self.soldier_1_event_1.evaluation_type.type): 0,
                str(self.soldier_3_event_1.evaluation_type.type): 0,
                str(self.soldier_1_event_2.training_type.type): 0,
            },
        ]

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
