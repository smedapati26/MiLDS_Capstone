from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.events.routes import router
from forms.api.events.schema import EventTask
from forms.models import Event, EventTasks
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
class Add7817EndpointTest(TestCase):
    # Initial setup for the add 7817 endpoint functionality
    def setUp(self):
        self.client = TestClient(router)
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
            "date": "2023-11-01",
            "event_type": self.event_type_training.type,
            "training_type": self.training_type.type,
            "comments": "Trained with ASB",
            "maintenance_level": "ML3",
        }
        self.training_data_invalid_type = {
            "uic": self.unit.uic,
            "date": "2023-11-01",
            "event_type": self.event_type_training.type,
            "training_type": "Does Not Exist",
            "comments": "Trained with ASB",
            "maintenance_level": "ML3",
        }
        self.invalid_unit_training_data = {
            "uic": "YYYYYY",
            "date": "2023-11-01",
            "event_type": self.event_type_training.type,
            "training_type": self.training_type.type,
            "comments": "Trained with ASB",
            "maintenance_level": "ML3",
        }
        self.invalid_tcs_location_training_data = {
            "uic": self.unit.uic,
            "date": "2023-11-01",
            "event_type": self.event_type_training.type,
            "training_type": self.training_type.type,
            "tcs_location": "DOES NOT EXIST",
            "comments": "Trained with ASB",
            "maintenance_level": "ML3",
        }
        self.evaluation_data = {
            "uic": self.unit.uic,
            "date": "2023-11-01",
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": self.evaluation_result_nogo,
            "comments": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.evaluation_data_invalid_recorder = {
            "uic": self.unit.uic,
            "date": "2023-11-01",
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": self.evaluation_type_annual.type,
            "go_nogo": self.evaluation_result_nogo,
            "comments": "Annual evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": "01",
        }
        self.evaluation_data_blank_mx_hours = {
            "uic": self.unit.uic,
            "date": "2023-01-06",
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": self.evaluation_type_no_notice.type,
            "go_nogo": self.evaluation_result_go,
            "comments": "No Notice evaluation on January 6th",
            "maintenance_level": "ML4",
            "total_mx_hours": "",
        }
        self.evaluation_data_no_event_type = {
            "uic": self.unit.uic,
            "date": "2023-11-01",
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": self.evaluation_result_nogo,
            "comments": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.evaluation_data_invalid_event_type = {
            "uic": self.unit.uic,
            "date": "2023-11-01",
            "event_type": "Does Not Exist",
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": self.evaluation_result_nogo,
            "comments": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.evaluation_data_invalid_evaluation_type = {
            "uic": self.unit.uic,
            "date": "2023-11-01",
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": "Does Not Exist",
            "go_nogo": self.evaluation_result_nogo,
            "comments": "Commander's evaluation on November 1st",
            "maintenance_level": "ML3",
            "total_mx_hours": 300.00,
            "recorded_by": self.evaluator.user_id,
        }
        self.new_evaluation_data = {
            "uic": self.unit.uic,
            "date": "2023-11-06",
            "event_type": self.event_type_evaluation.type,
            "evaluation_type": self.evaluation_type_cdr.type,
            "go_nogo": self.evaluation_result_go,
            "comments": "Commander's evaluation on November 6th",
            "maintenance_level": "ML4",
            "total_mx_hours": 500.00,
        }
        self.award_data = {
            "uic": self.unit.uic,
            "date": "2023-11-01",
            "event_type": self.event_type_award.type,
            "award_type": self.award_type_arcom.type,
            "comments": "Awarded ARCOM for exemplary performance while assigned to D CO, 1-100 AV",
            "maintenance_level": "ML3",
        }
        self.award_data_invalid_type = {
            "uic": self.unit.uic,
            "date": "2023-11-01",
            "event_type": self.event_type_award.type,
            "award_type": "Does Not Exist",
            "comments": "Awarded ARCOM for exemplary performance while assigned to D CO, 1-100 AV",
            "maintenance_level": "ML3",
        }
        self.pcs_data = {
            "uic": self.unit.uic,
            "date": "2024-01-11",
            "event_type": self.event_type_pcs_ets.type,
            "comments": "Soldier PCSed from 1-100 TEST to 2-100 TEST",
            "maintenance_level": "ML3",
            "gaining_unit": self.second_unit.uic,
        }
        self.pcs_data_invalid_unit = {
            "uic": self.unit.uic,
            "date": "2024-01-12",
            "event_type": self.event_type_pcs_ets.type,
            "comments": "Soldier PCSed from 1-100 TEST to 3-100 TEST",
            "maintenance_level": "ML3",
            "gaining_unit": "INVALID",
        }
        self.in_unit_transfer_data = {
            "uic": self.unit.uic,
            "date": "2024-01-11",
            "event_type": self.event_type_in_unit_transfer.type,
            "comments": "Soldier transferred from 1-100 TEST to 2-100 TEST",
            "maintenance_level": "ML3",
            "gaining_unit": self.second_unit.uic,
        }
        self.in_unit_transfer_data_invalid_unit = {
            "uic": self.unit.uic,
            "date": "2024-01-12",
            "event_type": self.event_type_in_unit_transfer.type,
            "comments": "Soldier transferred from 1-100 TEST to 3-100 TEST",
            "maintenance_level": "ML3",
            "gaining_unit": "INVALID",
        }

    def test_invalid_soldier_dod_id(self):
        """
        Checks that the correct response is issued when attempting to use an invalid soldier_id
        """
        response = self.client.post(f"/events/not{self.soldier.user_id}/add_7817", json=self.training_data)

        self.assertEqual(response.status_code, 404)

    def test_invalid_unit(self):
        """
        Checks that the correct response is issued when attempting to use an invalid unit
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.invalid_unit_training_data)

        self.assertEqual(response.status_code, 404)

    @tag("eval")
    def test_create_evaluation(self):
        """
        Checks that an evaluation is properly created adding an evaluation event
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.evaluation_data)
        event = Event.objects.filter(soldier=self.soldier).first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(event.total_mx_hours, 300.00)
        self.assertEqual(event.recorded_by, self.evaluator)

    @tag("eval_task")
    def test_create_evaluation_with_one_associated_task(self):
        """
        Checks that an evaluation is properly created adding an evaluation event which includes a single task trained on
        """
        eval_with_task_data = self.evaluation_data.copy()
        eval_with_task_data["event_tasks"] = [
            {"number": self.task1.task_number, "name": self.task1.task_title, "go_nogo": "GO"}
        ]

        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=eval_with_task_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(EventTasks.objects.count(), 1)

    @tag("eval_invalid_task")
    def test_create_evaluation_with_invalid_associated_task(self):
        """
        Checks that an evaluation is properly created adding an evaluation event which includes
        and invalid task - returns not found error
        """
        eval_with_invalid_task_data = self.evaluation_data.copy()
        eval_with_invalid_task_data["event_tasks"] = [{"number": "001", "name": "BeepBoop", "go_nogo": "GO"}]

        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=eval_with_invalid_task_data)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(EventTasks.objects.count(), 0)

    @tag("eval_invalid_tasks")
    def test_create_evaluation_with_invalid_associated_tasks(self):
        """
        Checks that an evaluation is properly created adding an evaluation event which includes two tasks,
        with one of them being invalid - returns not found error
        """
        eval_with_invalid_tasks_data = self.evaluation_data.copy()
        eval_with_invalid_tasks_data["event_tasks"] = [
            {"number": self.task1.task_number, "name": self.task1.task_title, "go_nogo": "GO"},
            {"number": "NOT:" + self.task2.task_number, "name": "NOT:" + self.task2.task_title, "go_nogo": "GO"},
        ]

        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=eval_with_invalid_tasks_data)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(EventTasks.objects.count(), 1)

    @tag("eval_multiple_tasks")
    def test_create_evaluation_with_multiple_associated_tasks(self):
        """
        Checks that an evaluation is properly created adding an evaluation event which includes a single task trained on
        """
        eval_with_tasks_data = self.evaluation_data.copy()
        eval_with_tasks_data["event_tasks"] = [
            {"number": self.task1.task_number, "name": self.task1.task_title, "go_nogo": "GO"},
            {"number": self.task2.task_number, "name": self.task2.task_title, "go_nogo": "GO"},
        ]

        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=eval_with_tasks_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(EventTasks.objects.count(), 2)

    @tag("increase_ml")
    def test_evaluation_increases_ml(self):
        """
        Checks that an evaluation resulting in an increase in ML correctly reflects the update
        to the soldiers ML
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.new_evaluation_data)
        # Refresh from db to capture updates
        self.soldier.refresh_from_db()

        self.assertEqual(response.status_code, 200)

    @tag("eval_invalid_recorder")
    def test_create_evaluation_invalid_recorder(self):
        """
        Checks that an evaluation with an invalid recorder id returns bad request
        """
        response = self.client.post(
            f"/events/{self.soldier.user_id}/add_7817", json=self.evaluation_data_invalid_recorder
        )

        self.assertEqual(response.status_code, 404)

    @tag("eval_no_event_type")
    def test_create_evaluation_no_event_type(self):
        """
        Checks that an evaluation with no event_type returns bad request
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.evaluation_data_no_event_type)

        self.assertEqual(response.status_code, 422)

    @tag("eval_invalid_event_type")
    def test_create_evaluation_invalid_event_type(self):
        """
        Checks that an evaluation with an invalid event_type returns bad request
        """
        response = self.client.post(
            f"/events/{self.soldier.user_id}/add_7817", json=self.evaluation_data_invalid_event_type
        )

        self.assertEqual(response.status_code, 404)

    @tag("eval_invalid_evaluation_type")
    def test_create_evaluation_invalid_evaluation_type(self):
        """
        Checks that an evaluation with an invalid evaluation_type returns bad request
        """
        response = self.client.post(
            f"/events/{self.soldier.user_id}/add_7817", json=self.evaluation_data_invalid_evaluation_type
        )

        self.assertEqual(response.status_code, 404)

    @tag("eval_blank_mx_hours")
    def test_create_evaluation_blank_mx_hours(self):
        """
        Checks that an evaluation with blank mx hours sets mx hours as None
        """
        response = self.client.post(
            f"/events/{self.soldier.user_id}/add_7817", json=self.evaluation_data_blank_mx_hours
        )
        event = Event.objects.filter(soldier=self.soldier).first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(event.total_mx_hours, None)

    def test_create_training(self):
        """
        Checks that a training is properly created when adding a training event
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.training_data)
        event = Event.objects.filter(soldier=self.soldier).first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Event.objects.all().count(), 1)
        self.assertEqual(event.event_type.type, "Training")
        self.assertEqual(event.training_type.type, "Weight and Balance")

    def test_create_training_invalid_training_type(self):
        """
        Checks that a training catches an invalid training type
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.training_data_invalid_type)

        self.assertEqual(response.status_code, 404)

    def test_create_training_invalid_tcs_location(self):
        """
        Checks that a training catches an invalid tcs location
        """
        response = self.client.post(
            f"/events/{self.soldier.user_id}/add_7817", json=self.invalid_tcs_location_training_data
        )

        self.assertEqual(response.status_code, 404)

    @tag("pcs_event")
    def test_pcs_event(self):
        """
        Checks that a PCS event to a valid unit is properly handled
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.pcs_data)
        event = Event.objects.filter(soldier=self.soldier).first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(event.gaining_unit, self.second_unit)

    @tag("invalid_pcs_event")
    def test_pcs_invalid_unit(self):
        """
        Checks that a PCS event to a non-valid unit returns unit does not exist error
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.pcs_data_invalid_unit)

        self.assertEqual(response.status_code, 404)

    @tag("in_unit_transfer_event")
    def test_in_unit_transfer_event(self):
        """
        Checks that an In-Unit transfer event to a valid unit is properly handled
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.in_unit_transfer_data)
        event = Event.objects.filter(soldier=self.soldier).first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(event.gaining_unit, self.second_unit)

    @tag("invalid_in_unit_transfer_event")
    def test_in_unit_transfer_invalid_unit(self):
        """
        Checks that an In-unit transfer event to a non-valid unit returns unit does not exist error
        """
        response = self.client.post(
            f"/events/{self.soldier.user_id}/add_7817", json=self.in_unit_transfer_data_invalid_unit
        )

        self.assertEqual(response.status_code, 404)

    def test_create_award_invalid_award_type(self):
        """
        Checks that a award catches an invalid award type
        """
        response = self.client.post(f"/events/{self.soldier.user_id}/add_7817", json=self.award_data_invalid_type)

        self.assertEqual(response.status_code, 404)
