import json
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.events.routes import router
from forms.model_utils import AwardType as OldAwardType
from forms.model_utils import EvaluationResult
from forms.model_utils import EvaluationType as OldEvaluationType
from forms.model_utils import EventType as OldEventType
from forms.model_utils import TrainingType as OldTrainingType
from forms.models import Event, EventTasks
from utils.http.constants import (
    HTTP_404_AWARD_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVENT_TYPE_DOES_NOT_EXIST,
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_404_TCS_LOCATION_DOES_NOT_EXIST,
    HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST,
)
from utils.tests import (
    create_single_test_event,
    create_test_award_type,
    create_test_evaluation_type,
    create_test_event_task,
    create_test_event_type,
    create_test_soldier,
    create_test_task,
    create_test_tcs_location,
    create_test_training_type,
    create_testing_unit,
)


@tag("forms", "edit_7817")
class Edit7817Tests(TestCase):
    # Initial setup for the edit 7817 endpoint functionality
    # -- Creating the needed models
    def setUp(self) -> None:
        self.client = TestClient(router)

        # Create Unit
        self.test_unit = create_testing_unit()
        self.test_gaining_unit = create_testing_unit(uic="TESTAA")

        # Create Soldier
        self.test_user = create_test_soldier(unit=self.test_unit)
        self.test_initial_recorder = create_test_soldier(unit=self.test_unit, user_id=1111111111)
        self.test_new_recorder = create_test_soldier(unit=self.test_unit, user_id=2222222222)

        # Create DA7817 Event
        self.test_event = create_single_test_event(
            id=1684,
            soldier=self.test_user,
            uic=self.test_unit,
            recorded_by=self.test_initial_recorder,
        )

        # Create Task and EventTask
        self.task = create_test_task()
        self.task2 = create_test_task(task_number="TEST000AA-TASK0001")
        self.event_task = create_test_event_task(event=self.test_event, task=self.task)

        # Create Type Models
        self.event_type_pcs_ets = create_test_event_type(event_type="PCS/ETS")
        self.event_type_in_unit_transfer = create_test_event_type(event_type="In-Unit Transfer")

        # Create TCS Location
        self.tcs_location = create_test_tcs_location()

        # PCS Event Data
        self.pcs_event_data = {
            "date": "2023-12-23",
            "event_type": self.event_type_pcs_ets.type,
            "gaining_unit": self.test_gaining_unit.uic,
            "comments": "PCS",
            "mx_hours": 10,
            "ml": "ML1",
        }

        # In-Unit Transfer Event Data
        self.in_unit_transfer_event_data = {
            "date": "2023-12-23",
            "event_type": self.event_type_in_unit_transfer.type,
            "gaining_unit": self.test_gaining_unit.uic,
            "comments": "PCS",
            "mx_hours": 10,
            "ml": "ML1",
        }

    def test_edit_with_no_user_id_in_header(self):
        """
        Checks that the put request has the user who made the request in the header, if not return 404
        """
        response = self.client.put(
            f"/events/{self.test_event.id}", json={"recorder": str(self.test_new_recorder.user_id)}
        )
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_user(self, mock_get_user_string):
        """
        Checks that the userid passed is a valid user id
        """
        invalid_user_id = "NOT" + self.test_user.user_id
        mock_user_string = f"CN=DOE.JOHN.A.{invalid_user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.put(f"/events/{self.test_event.id}", json=self.pcs_event_data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], "Not Found")

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_7817_id(self, mock_get_user_string):
        """
        Checks that incorrect 7817 id passed returns not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.put("/events/123123", json=self.pcs_event_data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], "Not Found")

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_event_type(self, mock_get_user_string):
        """
        Checks that incorrect event_type passed returns not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = self.pcs_event_data.copy()
        data["event_type"] = "Does Not Exist"

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 404)
        response_data = response.json()

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, "Evaluation")
        self.assertEqual(self.test_event.date.isoformat(), "2023-12-25")
        self.assertEqual(self.test_event.comment, "TST_COMMENTS")
        self.assertEqual(self.test_event.go_nogo, EvaluationResult.GO)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_event_add_valid_task(self, mock_get_user_string):
        """
        Checks that editing an event with one associated task and a different valid task is successful
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_tasks": self.task2.task_number,
            "tcs_location": self.tcs_location.abbreviation,
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        event_tasks = EventTasks.objects.filter(event=self.test_event)

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(event_tasks.count(), 1)
        self.assertEqual(event_tasks.first().task.task_number, self.task2.task_number)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_event_add_multiple_valid_tasks(self, mock_get_user_string):
        """
        Checks that editing an event with one associated task and adding multiple valid tasks is successful
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_tasks": [self.task.task_number, self.task2.task_number],
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        event_tasks = EventTasks.objects.filter(event=self.test_event)

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(event_tasks.count(), 2)
        task_numbers = [et.task.task_number for et in event_tasks]
        self.assertIn(self.task.task_number, task_numbers)
        self.assertIn(self.task2.task_number, task_numbers)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_event_add_invalid_task(self, mock_get_user_string):
        """
        Checks that editing an event with one associated task and adding an invalid task
        returns task not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_tasks": "NOT" + self.task2.task_number,
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], HTTP_404_TASK_DOES_NOT_EXIST)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_event_add_invalid_tasks(self, mock_get_user_string):
        """
        Checks that editing an event with one associated task and adding a valid task and
        another invalid task returns task not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_tasks": [self.task.task_number, "NOT" + self.task2.task_number],
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], HTTP_404_TASK_DOES_NOT_EXIST)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_evaluation_type(self, mock_get_user_string):
        """
        Checks that incorrect evaluation passed returns not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = self.pcs_event_data.copy()
        data["evaluation_type"] = "Does Not Exist"

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_training_type(self, mock_get_user_string):
        """
        Checks that incorrect training_type passed returns not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = self.pcs_event_data.copy()
        data["training_type"] = "Does Not Exist"

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_award_type(self, mock_get_user_string):
        """
        Checks that incorrect award_type passed returns not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = self.pcs_event_data.copy()
        data["award_type"] = "Does Not Exist"

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], HTTP_404_AWARD_TYPE_DOES_NOT_EXIST)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_tcs_location(self, mock_get_user_string):
        """
        Checks that incorrect tcs_location passed returns not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = self.pcs_event_data.copy()
        data["tcs_location"] = "Does Not Exist"

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], HTTP_404_TCS_LOCATION_DOES_NOT_EXIST)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_PCS_event_via_http_put(self, mock_get_user_string):
        """
        Checks that PCS events can correctly be edited
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.put(f"/events/{self.test_event.id}", json=self.pcs_event_data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data["message"], "DA-7817 Event Record Updated Successfully")
        self.assertTrue(response_data["success"])
        self.assertEqual(response_data["event_id"], self.test_event.id)

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.PCSorETS)
        self.assertEqual(self.test_event.gaining_unit, self.test_gaining_unit)
        self.assertEqual(self.test_event.date.isoformat(), self.pcs_event_data["date"])
        self.assertEqual(self.test_event.comment, self.pcs_event_data["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 10)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_in_unit_transfer_event_via_http_put(self, mock_get_user_string):
        """
        Checks that In-Unit transfer events can correctly be edited
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.put(f"/events/{self.test_event.id}", json=self.in_unit_transfer_event_data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data["message"], "DA-7817 Event Record Updated Successfully")
        self.assertTrue(response_data["success"])

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.InUnitTransfer)
        self.assertEqual(self.test_event.gaining_unit, self.test_gaining_unit)
        self.assertEqual(self.test_event.date.isoformat(), self.in_unit_transfer_event_data["date"])
        self.assertEqual(self.test_event.comment, self.in_unit_transfer_event_data["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 10)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_date_format(self, mock_get_user_string):
        """
        Checks that json body with invalid date format returns partial success message, date does not update
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = self.pcs_event_data.copy()
        data["date"] = "INVALID_FORMAT"

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertFalse(response_data["success"])
        self.assertIn("date", response_data["message"])

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.PCSorETS)
        self.assertEqual(self.test_event.gaining_unit, self.test_gaining_unit)
        self.assertEqual(self.test_event.date.isoformat(), "2023-12-25")  # Original date preserved
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_gaining_unit(self, mock_get_user_string):
        """
        Checks that json body with invalid gaining unit returns partial success message, gaining_unit does not update
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = self.pcs_event_data.copy()
        data["gaining_unit"] = "INVALID_UIC"

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertFalse(response_data["success"])
        self.assertIn("gaining_unit", response_data["message"])

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.PCSorETS)
        self.assertEqual(self.test_event.gaining_unit, None)  # No gaining unit set
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_invalid_mx_hours(self, mock_get_user_string):
        """
        Checks that json body with invalid mx hours returns partial success message, mx hours does not update
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = self.pcs_event_data.copy()
        data["mx_hours"] = -5

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertFalse(response_data["success"])
        self.assertIn("mx_hours", response_data["message"])

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.PCSorETS)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 0)  # Original value

    @patch("utils.http.user_id.get_user_string")
    def test_edit_with_null_mx_hours(self, mock_get_user_string):
        """
        Checks that json body with null mx hours sets mx hours to None
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = self.pcs_event_data.copy()
        data["mx_hours"] = None

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(self.test_event.total_mx_hours, 0.0)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_evaluation_event_via_http_put(self, mock_get_user_string):
        """
        Checks that evaluation events can correctly be edited
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_type": create_test_event_type(event_type="Evaluation").type,
            "evaluation_type": create_test_evaluation_type(evaluation_type="No Notice").type,
            "date": "2023-12-14",
            "comments": "Test comment",
            "go_nogo": EvaluationResult.NOGO,
            "mx_hours": 20,
            "ml": "ML2",
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.Evaluation)
        self.assertEqual(self.test_event.evaluation_type.type, OldEvaluationType.NoNotice)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(self.test_event.go_nogo, EvaluationResult.NOGO)
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 20)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_evaluation_event_raise_ml(self, mock_get_user_string):
        """
        Checks that evaluation events can correctly be edited to change a soldier ML
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "ml": "ML4",
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(self.test_event.maintenance_level, "ML4")

    @patch("utils.http.user_id.get_user_string")
    def test_edit_training_event_via_http_put(self, mock_get_user_string):
        """
        Checks that the training event is edit correctly
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_type": create_test_event_type(event_type="Training").type,
            "training_type": create_test_training_type(training_type="Hazardous Materials").type,
            "date": "2023-12-19",
            "comments": "SSG Kerr passed CDRs eval - designated ML1",
            "go_nogo": EvaluationResult.GO,
            "mx_hours": 1000,
            "ml": "ML1",
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.Training)
        self.assertEqual(self.test_event.training_type.type, OldTrainingType.HAZMAT)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(self.test_event.go_nogo, EvaluationResult.GO)
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 1000)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_award_event_via_http_put(self, mock_get_user_string):
        """
        Checks that award events can correctly be edited
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_type": create_test_event_type(event_type="Award").type,
            "award_type": create_test_award_type(award_type="SSTAR").type,
            "date": "2023-12-16",
            "comments": "New comment",
            "mx_hours": 100.1,
            "ml": "ML2",
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.Award)
        self.assertEqual(self.test_event.award_type.type, OldAwardType.SSTAR)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 100.1)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_records_review_event_via_http_put(self, mock_get_user_string):
        """
        Checks that record review events can correctly be edited
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_type": create_test_event_type(event_type="Records Review").type,
            "date": "2023-12-29",
            "comments": "Test Comment",
            "mx_hours": 4000000000000,
            "ml": "ML4",
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.RecordsReview)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 4000000000000)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_other_event_via_http_put(self, mock_get_user_string):
        """
        Checks that other events can correctly be edited
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_type": create_test_event_type(event_type="Other").type,
            "date": "2024-01-05",
            "comments": "Test Comment",
            "go_nogo": EvaluationResult.NA,
            "ml": "ML1",
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])

        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.event_type.type, OldEventType.Other)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(self.test_event.go_nogo, EvaluationResult.NA)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_event_add_valid_task(self, mock_get_user_string):
        """
        Checks that editing an event with one associated task and a different valid task is successful
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_tasks": [{"number": self.task2.task_number, "name": self.task2.task_title, "go_nogo": "GO"}],
            "tcs_location": self.tcs_location.abbreviation,
        }
        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        event_tasks = EventTasks.objects.filter(event=self.test_event)

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(event_tasks.count(), 1)
        self.assertEqual(event_tasks.first().task.task_number, self.task2.task_number)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_event_add_multiple_valid_tasks(self, mock_get_user_string):
        """
        Checks that editing an event with one associated task and adding multiple valid tasks is successful
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_tasks": [
                {"number": self.task.task_number, "name": self.task.task_title, "go_nogo": "GO"},
                {"number": self.task2.task_number, "name": self.task2.task_title, "go_nogo": "GO"},
            ]
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        event_tasks = EventTasks.objects.filter(event=self.test_event)

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(event_tasks.count(), 2)
        task_numbers = [et.task.task_number for et in event_tasks]
        self.assertIn(self.task.task_number, task_numbers)
        self.assertIn(self.task2.task_number, task_numbers)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_event_add_invalid_task(self, mock_get_user_string):
        """
        Checks that editing an event with one associated task and adding an invalid task
        returns task not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_tasks": [
                {"number": "NOT:" + self.task2.task_number, "name": "NOT:" + self.task2.task_title, "go_nogo": "GO"},
            ],
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], HTTP_404_TASK_DOES_NOT_EXIST)

    @patch("utils.http.user_id.get_user_string")
    def test_edit_event_add_invalid_tasks(self, mock_get_user_string):
        """
        Checks that editing an event with one associated task and adding a valid task and
        another invalid task returns task not found error
        """
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_new_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "event_tasks": [
                {"number": self.task.task_number, "name": self.task.task_title, "go_nogo": "GO"},
                {"number": "NOT:" + self.task2.task_number, "name": "NOT:" + self.task2.task_title, "go_nogo": "GO"},
            ],
        }

        response = self.client.put(f"/events/{self.test_event.id}", json=data)

        self.assertEqual(response.status_code, 404)
        response_data = response.json()
        self.assertEqual(response_data["detail"], HTTP_404_TASK_DOES_NOT_EXIST)
