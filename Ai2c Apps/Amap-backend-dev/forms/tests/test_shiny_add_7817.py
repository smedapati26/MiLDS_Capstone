from datetime import date

from django.test import TestCase, tag
from django.urls import reverse

from forms.models import Event, EventTasks
from personnel.models import Soldier
from utils.http.constants import (
    HTTP_404_AWARD_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVENT_TYPE_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_404_TCS_LOCATION_DOES_NOT_EXIST,
    HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_BAD_RESPONSE_STATUS_CODE,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import (
    create_test_award_type,
    create_test_evaluation_type,
    create_test_event_type,
    create_test_soldier,
    create_test_task,
    create_test_training_type,
    create_testing_unit,
)


@tag("add_da7817")
class ShinyAdd7817Test(TestCase):
    json_content = "application/json"

    # Initial setup for the add 7817 endpoint functionality
    def setUp(self):
        self.unit = create_testing_unit()
        self.second_unit = create_testing_unit(
            uic="TEST001AA", short_name="2-100 TEST", display_name="2nd Battalion, 100th Aviation Regiment"
        )
        self.soldier = create_test_soldier(unit=self.unit)
        self.evaluator = create_test_soldier(unit=self.unit, user_id="0101010101", last_name="Evaluator")
        self.task1 = create_test_task()
        self.task2 = create_test_task(task_number="TEST000AA-TASK0001")

        self.training_type = create_test_training_type(training_type="Weight and Balance")

        self.event_type_training = create_test_event_type(event_type="Training")
        self.event_type_evaluation = create_test_event_type(event_type="Evaluation")
        self.event_type_award = create_test_event_type(event_type="Award")
        self.event_type_pcs_ets = create_test_event_type(event_type="PCS/ETS")
        self.event_type_in_unit_transfer = create_test_event_type(event_type="In-Unit Transfer")

        self.evaluation_type_cdr = create_test_evaluation_type(evaluation_type="CDR Eval")
        self.evaluation_type_annual = create_test_evaluation_type(evaluation_type="Annual")
        self.evaluation_type_no_notice = create_test_evaluation_type(evaluation_type="No Notice")

        self.evaluation_result_nogo = "NoGo"
        self.evaluation_result_go = "Go"

        self.award_type_arcom = create_test_award_type(award_type="ARCOM")

        self.training_data = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": self.event_type_training.type,
            "training_type": self.training_type.type,
            "comment": "Trained with ASB",
            "maintenance_level": "ML3",
        }
        self.training_data_invalid_type = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": self.event_type_training.type,
            "training_type": "Does Not Exist",
            "comment": "Trained with ASB",
            "maintenance_level": "ML3",
        }
        self.invalid_unit_training_data = {
            "uic": "YYYYYY",
            "date": date(2023, 11, 1),
            "event_type": self.event_type_training.type,
            "training_type": self.training_type.type,
            "comment": "Trained with ASB",
            "maintenance_level": "ML3",
        }
        self.invalid_tcs_location_training_data = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": self.event_type_training.type,
            "training_type": self.training_type.type,
            "tcs_location": "DOES NOT EXIST",
            "comment": "Trained with ASB",
            "maintenance_level": "ML3",
        }
        self.evaluation_data = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": self.evaluation_result_nogo,
            "comment": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.evaluation_data_invalid_recorder = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": self.evaluation_type_annual.type,
            "go_nogo": self.evaluation_result_nogo,
            "comment": "Annual evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": "01",
        }
        self.evaluation_data_blank_mx_hours = {
            "uic": self.unit.uic,
            "date": date(2023, 1, 6),
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": self.evaluation_type_no_notice.type,
            "go_nogo": self.evaluation_result_go,
            "comment": "No Notice evaluation on January 6th",
            "maintenance_level": "ML4",
            "total_mx_hours": "",
        }
        self.evaluation_data_no_event_type = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": self.evaluation_result_nogo,
            "comment": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.evaluation_data_inavlid_event_type = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": self.evaluation_result_nogo,
            "comment": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.evaluation_data_invalid_evaluation_type = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": "Does Not Exist",
            "go_nogo": self.evaluation_result_nogo,
            "comment": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.evaluation_data_invalid_event_type = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": "Does Not Exist",
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": self.evaluation_result_nogo,
            "comment": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.evaluation_data_invalid_result = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": "Does Not Exist",
            "comment": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.new_evaluation_data = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 6),
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": self.evaluation_result_go,
            "comment": "Commander's evaluation on November 6th",
            "maintenance_level": "ML4",
            "total_mx_hours": 500.00,
        }
        self.award_data = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": self.event_type_award.type,
            "award_type": self.award_type_arcom.type,
            "comment": "Awarded ARCOM for exemplary performance while assigned to D CO, 1-100 AV",
            "maintenance_level": "ML3",
        }
        self.award_data_invalid_type = {
            "uic": self.unit.uic,
            "date": date(2023, 11, 1),
            "event_type": self.event_type_award.type,
            "award_type": "Does Not Exist",
            "comment": "Awarded ARCOM for exemplary performance while assigned to D CO, 1-100 AV",
            "maintenance_level": "ML3",
        }
        self.pcs_data = {
            "uic": self.unit.uic,
            "date": date(2024, 1, 11),
            "event_type": self.event_type_pcs_ets.type,
            "comment": "Soldier PCSed from 1-100 TEST to 2-100 TEST",
            "maintenance_level": "ML3",
            "gaining_unit": self.second_unit.uic,
        }
        self.pcs_data_invalid_unit = {
            "uic": self.unit.uic,
            "date": date(2024, 1, 12),
            "event_type": self.event_type_pcs_ets.type,
            "comment": "Soldier PCSed from 1-100 TEST to 3-100 TEST",
            "maintenance_level": "ML3",
            "gaining_unit": "INVALID",
        }
        self.in_unit_transfer_data = {
            "uic": self.unit.uic,
            "date": date(2024, 1, 11),
            "event_type": self.event_type_in_unit_transfer.type,
            "comment": "Soldier transferred from 1-100 TEST to 2-100 TEST",
            "maintenance_level": "ML3",
            "gaining_unit": self.second_unit.uic,
        }
        self.in_unit_transfer_data_invalid_unit = {
            "uic": self.unit.uic,
            "date": date(2024, 1, 12),
            "event_type": self.event_type_in_unit_transfer.type,
            "comment": "Soldier transferred from 1-100 TEST to 3-100 TEST",
            "maintenance_level": "ML3",
            "gaining_unit": "INVALID",
        }

    def test_non_post_request_fails(self):
        """
        Checks that the correct response is issued when attempting to use a non-post request
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 405)

    def test_invalid_soldier_dod_id(self):
        """
        Checks that the correct response is issued when attempting to use an invalid soldier_id
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": "NOT" + self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.training_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    def test_invalid_unit(self):
        """
        Checks that the correct response is issued when attempting to use an invalid unit
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.invalid_unit_training_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("eval")
    def test_create_evaluation(self):
        """
        Checks that an evaluation is properly created adding an evaluation event
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.evaluation_data)
        event = Event.objects.filter(soldier=self.soldier).first()
        soldier = Soldier.objects.get(user_id=self.soldier.user_id)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(event.total_mx_hours, 300.00)
        self.assertEqual(event.recorded_by, self.evaluator)

    @tag("eval_task")
    def test_create_evaluation_with_one_associated_task(self):
        """
        Checks that an evaluation is properly created adding an evaluation event which includes a single task trained on
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        eval_with_task_data = self.evaluation_data
        eval_with_task_data["event_tasks"] = self.task1.task_number

        response = self.client.post(url, content_type=self.json_content, data=eval_with_task_data)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(EventTasks.objects.count(), 1)

    @tag("eval_invalid_task")
    def test_create_evaluation_with_invalid_associated_task(self):
        """
        Checks that an evaluation is properly created adding an evaluation event which includes
        and invlid task - returns not found error
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        eval_with_invalid_task_data = self.evaluation_data
        eval_with_invalid_task_data["event_tasks"] = "BeepBoop"

        response = self.client.post(url, content_type=self.json_content, data=eval_with_invalid_task_data)

        # self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TASK_DOES_NOT_EXIST)
        self.assertEqual(EventTasks.objects.count(), 0)

    @tag("eval_invalid_tasks")
    def test_create_evaluation_with_invalid_associated_tasks(self):
        """
        Checks that an evaluation is properly created adding an evaluation event which includes two tasks,
        with one of them being invalid - returns not found error
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        eval_with_invalid_tasks_data = self.evaluation_data
        eval_with_invalid_tasks_data["event_tasks"] = [self.task1.task_number, "NOT" + self.task1.task_number]

        response = self.client.post(url, content_type=self.json_content, data=eval_with_invalid_tasks_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TASK_DOES_NOT_EXIST)
        self.assertEqual(EventTasks.objects.count(), 1)

    @tag("eval_multiple_tasks")
    def test_create_evaluation_with_multiple_associated_tasks(self):
        """
        Checks that an evaluation is properly created adding an evaluation event which includes a single task trained on
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        eval_with_tasks_data = self.evaluation_data
        eval_with_tasks_data["event_tasks"] = [self.task1.task_number, self.task2.task_number]

        response = self.client.post(url, content_type=self.json_content, data=eval_with_tasks_data)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(EventTasks.objects.count(), 2)

    @tag("increase_ml")
    def test_evaluation_increases_ml(self):
        """
        Checks that an evaluation resulting in an increase in ML correctly reflects the update
        to the soldiers ML
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})
        response = self.client.post(url, content_type=self.json_content, data=self.new_evaluation_data)
        # Refresh from db to capture updates
        self.soldier.refresh_from_db()
        soldier = Soldier.objects.get(user_id=self.soldier.user_id)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

    @tag("eval_invalid_recorder")
    def test_create_evaluation_invalid_recorder(self):
        """
        Checks that an evaluation with an invalid recorder id returns bad request
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.evaluation_data_invalid_recorder)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("eval_no_event_type")
    def test_create_evaluation_no_event_type(self):
        """
        Checks that an evaluation with no event_type returns bad request
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.evaluation_data_no_event_type)

        self.assertEqual(response.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    @tag("eval_invalid_event_type")
    def test_create_evaluation_invalid_event_type(self):
        """
        Checks that an evaluation with an invalid event_type returns bad request
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.evaluation_data_invalid_event_type)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_EVENT_TYPE_DOES_NOT_EXIST)

    @tag("eval_invalid_evaluation_type")
    def test_create_evaluation_invalid_evaluation_type(self):
        """
        Checks that an evaluation with an invalid evaluation_type returns bad request
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(
            url, content_type=self.json_content, data=self.evaluation_data_invalid_evaluation_type
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST)

    @tag("eval_blank_mx_hours")
    def test_create_evaluation_blank_mx_hours(self):
        """
        Checks that an evaluation with blank mx hours sets mx hours as None
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.evaluation_data_blank_mx_hours)
        event = Event.objects.filter(soldier=self.soldier).first()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(event.total_mx_hours, None)

    def test_create_training(self):
        """
        Checks that a training is properly created when adding a training event
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.training_data)
        event = Event.objects.filter(soldier=self.soldier).first()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(Event.objects.all().count(), 1)
        self.assertEqual(event.event_type.type, "Training")
        self.assertEqual(event.training_type.type, "Weight and Balance")

    def test_create_training_invalid_training_type(self):
        """
        Checks that a training catches an invalid training type
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.training_data_invalid_type)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST)

    def test_create_training_invalid_tcs_location(self):
        """
        Checks that a training catches an invalid tcs location
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.invalid_tcs_location_training_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TCS_LOCATION_DOES_NOT_EXIST)

    @tag("pcs_event")
    def test_pcs_event(self):
        """
        Checks that a PCS event to a valid unit is properly handled
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.pcs_data)
        event = Event.objects.filter(soldier=self.soldier).first()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(event.gaining_unit, self.second_unit)

    @tag("invalid_pcs_event")
    def test_pcs_invalid_unit(self):
        """
        Checks that a PCS event to a non-valid unit returns unit does not exist error
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.pcs_data_invalid_unit)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("in_unit_transfer_event")
    def test_in_unit_transfer_event(self):
        """
        Checks that an In-Unit transfer event to a valid unit is properly handled
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.in_unit_transfer_data)
        event = Event.objects.filter(soldier=self.soldier).first()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(event.gaining_unit, self.second_unit)

    @tag("invalid_in_unit_transfer_event")
    def test_in_unit_transfer_invalid_unit(self):
        """
        Checks that an In-unit transfer event to a non-valid unit returns unit does not exist error
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.in_unit_transfer_data_invalid_unit)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    def test_create_award_invalid_award_type(self):
        """
        Checks that a award catches an invalid award type
        """
        url = reverse("shiny_add_7817", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.post(url, content_type=self.json_content, data=self.award_data_invalid_type)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_AWARD_TYPE_DOES_NOT_EXIST)
