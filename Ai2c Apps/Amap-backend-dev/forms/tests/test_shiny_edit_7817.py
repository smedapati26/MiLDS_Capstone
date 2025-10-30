from django.test import TestCase, tag
from django.urls import reverse

from forms.model_utils import AwardType as OldAwardType
from forms.model_utils import EvaluationResult
from forms.model_utils import EvaluationType as OldEvaluationType
from forms.model_utils import EventType as OldEventType
from forms.model_utils import TrainingType as OldTrainingType
from forms.models import Event, EventTasks
from personnel.model_utils import MaintenanceLevel
from utils.http.constants import (
    HTTP_404_AWARD_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVENT_TYPE_DOES_NOT_EXIST,
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_404_TCS_LOCATION_DOES_NOT_EXIST,
    HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST,
    HTTP_BAD_SERVER_STATUS_CODE,
    HTTP_ERROR_MESSAGE_7817_NOT_FOUND,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
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


@tag("forms", "shiny_edit_7817")
class Edit7817Tests(TestCase):
    json_content = "application/json"

    # Initial setup for the edit 7817 endpoint functionality
    # -- Creating the needed models
    def setUp(self) -> None:
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
            "soldier_id": self.test_user.user_id,
            "uic": self.test_event.uic.uic,
            "event_type": self.event_type_pcs_ets.type,
            "gaining_unit": self.test_gaining_unit.uic,
            "date": "2023-12-23",
            "comments": "PCS",
            "recorder": self.test_new_recorder.user_id,
            "mx_hours": 10,
            "ml": "ML1",
        }
        # In-Unit Transfer Event Data
        self.in_unit_transfer_event_data = {
            "soldier_id": self.test_user.user_id,
            "uic": self.test_event.uic.uic,
            "event_type": self.event_type_in_unit_transfer.type,
            "gaining_unit": self.test_gaining_unit.uic,
            "date": "2023-12-23",
            "comments": "PCS",
            "recorder": self.test_new_recorder.user_id,
            "mx_hours": 10,
            "ml": "ML1",
        }

    @tag("validation")
    def test_edit_with_no_user_id_in_header(self):
        """
        Checks that the put request has the user who made the request in the header
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        response = self.client.put(url, content_type=self.json_content)
        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_edit_with_invalid_user(self):
        """
        Checks that the userid passed is a valid user id
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        response = self.client.put(
            url,
            headers={"X-On-Behalf-Of": "NOT" + self.test_user.user_id},
            content_type=self.json_content,
        )
        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_with_invalid_7817_id(self):
        """
        Checks that incorrect 7817 id passed returns not found error
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": 123123})

        response = self.client.put(
            url,
            self.pcs_event_data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_7817_NOT_FOUND)

    @tag("validation")
    def test_edit_with_invalid_event_type(self):
        """
        Checks that incorrect event_type passed returns not found error
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        self.pcs_event_data["event_type"] = "Does Not Exist"

        response = self.client.put(
            url,
            self.pcs_event_data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_EVENT_TYPE_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_with_invalid_evaluation_type(self):
        """
        Checks that incorrect evaluation passed returns not found error
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        self.pcs_event_data["evaluation_type"] = "Does Not Exist"

        response = self.client.put(
            url,
            self.pcs_event_data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_with_invalid_training_type(self):
        """
        Checks that incorrect training_type passed returns not found error
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        self.pcs_event_data["training_type"] = "Does Not Exist"

        response = self.client.put(
            url,
            self.pcs_event_data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_with_invalid_award_type(self):
        """
        Checks that incorrect award_type passed returns not found error
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        self.pcs_event_data["award_type"] = "Does Not Exist"

        response = self.client.put(
            url,
            self.pcs_event_data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_AWARD_TYPE_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_with_invalid_tcs_location(self):
        """
        Checks that incorrect tcs_location passed returns not found error
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        self.pcs_event_data["tcs_location"] = "Does Not Exist"

        response = self.client.put(
            url,
            self.pcs_event_data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TCS_LOCATION_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_PCS_event_via_http_put(self):
        """
        Checks that PCS events can corrently be edited
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})

        response = self.client.put(
            url,
            self.pcs_event_data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "DA-7817 Event Record Updates")
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, self.pcs_event_data["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.PCSorETS)
        self.assertEqual(self.test_event.gaining_unit, self.test_gaining_unit)
        self.assertEqual(self.test_event.date.isoformat(), self.pcs_event_data["date"])
        self.assertEqual(self.test_event.comment, self.pcs_event_data["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 10)

    @tag("validation")
    def test_edit_in_unit_transfer_event_via_http_put(self):
        """
        Checks that In-Unit transfer events can corrently be edited
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})

        response = self.client.put(
            url,
            self.in_unit_transfer_event_data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "DA-7817 Event Record Updates")
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, self.pcs_event_data["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.InUnitTransfer)
        self.assertEqual(self.test_event.gaining_unit, self.test_gaining_unit)
        self.assertEqual(self.test_event.date.isoformat(), self.pcs_event_data["date"])
        self.assertEqual(self.test_event.comment, self.pcs_event_data["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 10)

    @tag("validation")
    def test_edit_with_invalid_date_format(self):
        """
        Checks that json body with invalid date format returns partial success message, date does not update
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})

        pcs_data_invalid_date = self.pcs_event_data
        pcs_data_invalid_date["date"] = "INVALID_FORMAT"

        response = self.client.put(
            url,
            pcs_data_invalid_date,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )
        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode("utf-8"),
            "DA-7817 form 1684 only received partial updates; fields [date] were not sucessful.",
        )
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, pcs_data_invalid_date["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.PCSorETS)
        self.assertEqual(self.test_event.gaining_unit, self.test_gaining_unit)
        self.assertEqual(self.test_event.date.isoformat(), "2023-12-25")
        self.assertEqual(self.test_event.comment, pcs_data_invalid_date["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 10)

    @tag("validation")
    def test_edit_with_invalid_gaining_unit(self):
        """
        Checks that json body with invalid gaining unit returns partial success message, gaining_unit does not update
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})

        pcs_data_invalid_gaining_unit = self.pcs_event_data
        pcs_data_invalid_gaining_unit["gaining_unit"] = "INVALID_UIC"

        response = self.client.put(
            url,
            pcs_data_invalid_gaining_unit,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )
        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode("utf-8"),
            "DA-7817 form 1684 only received partial updates; fields [gaining_unit] were not sucessful.",
        )
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, pcs_data_invalid_gaining_unit["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.PCSorETS)
        self.assertEqual(self.test_event.gaining_unit, None)
        self.assertEqual(self.test_event.date.isoformat(), pcs_data_invalid_gaining_unit["date"])
        self.assertEqual(self.test_event.comment, pcs_data_invalid_gaining_unit["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 10)

    @tag("validation")
    def test_edit_with_invalid_mx_hours(self):
        """
        Checks that json body with invalid mx hours returns partial success message, mx hours does not update
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})

        pcs_data_invalid_mx_hours = self.pcs_event_data
        pcs_data_invalid_mx_hours["mx_hours"] = -5

        response = self.client.put(
            url,
            pcs_data_invalid_mx_hours,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )
        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode("utf-8"),
            "DA-7817 form 1684 only received partial updates; fields [mx_hours] were not sucessful.",
        )
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, pcs_data_invalid_mx_hours["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.PCSorETS)
        self.assertEqual(self.test_event.gaining_unit, self.test_gaining_unit)
        self.assertEqual(self.test_event.date.isoformat(), pcs_data_invalid_mx_hours["date"])
        self.assertEqual(self.test_event.comment, pcs_data_invalid_mx_hours["comments"])
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 0)

    @tag("validation")
    def test_edit_with_null_mx_hours(self):
        """
        Checks that json body with null mx hours sets mx hours to None
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})

        pcs_data_null_mx_hours = self.pcs_event_data
        pcs_data_null_mx_hours["mx_hours"] = None

        response = self.client.put(
            url,
            pcs_data_null_mx_hours,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )
        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.test_event.total_mx_hours, None)

    @tag("validation")
    def test_edit_evaluation_event_via_http_put(self):
        """
        Checks that evaluation events can corrently be edited
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "soldier_id": self.test_user.user_id,
            "uic": self.test_unit.uic,
            "event_type": create_test_event_type(event_type="Evaluation").type,
            "evaluation_type": create_test_evaluation_type(evaluation_type="No Notice").type,
            "date": "2023-12-14",
            "comments": "Test comment",
            "go_nogo": EvaluationResult.NOGO,
            "recorder": self.test_new_recorder.user_id,
            "mx_hours": 20,
            "ml": "ML2",
        }
        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "DA-7817 Event Record Updates")
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, data["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.Evaluation)
        self.assertEqual(self.test_event.evaluation_type.type, OldEvaluationType.NoNotice)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(self.test_event.go_nogo, EvaluationResult.NOGO)
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 20)

    @tag("validation")
    def test_edit_evaluation_event_raise_ml(self):
        """
        Checks that evaluation events can corrently be edited to change a soldier ML
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "soldier_id": self.test_user.user_id,
            "recorder": self.test_new_recorder.user_id,
            "ml": "ML4",
        }
        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

    @tag("validation")
    def test_edit_training_event_via_http_put(self):
        """
        Checks that the training event is edit correctly
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "soldier_id": self.test_user.user_id,
            "uic": self.test_unit.uic,
            "event_type": create_test_event_type(event_type="Training").type,
            "training_type": create_test_training_type(training_type="Hazardous Materials").type,
            "date": "2023-12-19",
            "comments": "SSG Kerr passed CDRs eval - designated ML1",
            "go_nogo": EvaluationResult.GO,
            "recorder": self.test_new_recorder.user_id,
            "mx_hours": 1000,
            "ml": "ML1",
        }

        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "DA-7817 Event Record Updates")
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, data["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.Training)
        self.assertEqual(self.test_event.training_type.type, OldTrainingType.HAZMAT)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(self.test_event.go_nogo, EvaluationResult.GO)
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 1000)

    @tag("validation")
    def test_edit_award_event_via_htpp_put(self):
        """
        Checks that award events can corrently be edited
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "soldier_id": self.test_user.user_id,
            "uic": self.test_unit.uic,
            "event_type": create_test_event_type(event_type="Award").type,
            "award_type": create_test_award_type(award_type="SSTAR").type,
            "date": "2023-12-16",
            "comments": "New comment",
            "recorder": self.test_new_recorder.user_id,
            "mx_hours": 100.1,
            "ml": "ML2",
        }

        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "DA-7817 Event Record Updates")
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, data["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.Award)
        self.assertEqual(self.test_event.award_type.type, OldAwardType.SSTAR)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(self.test_event.go_nogo, EvaluationResult.GO)
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 100.1)

    @tag("validation")
    def test_edit_record_event_via_htpp_put(self):
        """
        Checks that record review events can corrently be edited
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "soldier_id": self.test_user.user_id,
            "uic": self.test_unit.uic,
            "event_type": create_test_event_type(event_type="Records Review").type,
            "date": "2023-12-29",
            "comments": "Test Comment",
            "recorder": self.test_new_recorder.user_id,
            "mx_hours": 4000000000000,
            "ml": "ML4",
        }

        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "DA-7817 Event Record Updates")
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, data["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.RecordsReview)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(self.test_event.go_nogo, EvaluationResult.GO)
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 4000000000000)

    @tag("validation")
    def test_edit_other_event_via_htpp_put(self):
        """
        Checks that other events can corrently be edited
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "soldier_id": self.test_user.user_id,
            "uic": self.test_unit.uic,
            "event_type": create_test_event_type(event_type="Other").type,
            "date": "2024-01-05",
            "comments": "Test Comment",
            "go_nogo": EvaluationResult.NA,
            "recorder": self.test_new_recorder.user_id,
            "ml": "ML1",
        }

        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        # Refresh from db to capture updates
        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "DA-7817 Event Record Updates")
        self.assertTrue(Event.objects.filter(id=self.test_event.id).exists())
        self.assertEqual(self.test_event.soldier, self.test_user)
        self.assertEqual(self.test_event.uic.uic, data["uic"])
        self.assertEqual(self.test_event.event_type.type, OldEventType.Other)
        self.assertEqual(self.test_event.date.isoformat(), data["date"])
        self.assertEqual(self.test_event.comment, data["comments"])
        self.assertEqual(self.test_event.go_nogo, EvaluationResult.NA)
        self.assertEqual(str(self.test_event.recorded_by.user_id), str(self.test_new_recorder.user_id))
        self.assertEqual(self.test_event.total_mx_hours, 0.0)

    @tag("validation")
    def test_edit_event_add_valid_task(self):
        """
        Checks that editing an event with one associated task and a different valid task is successful
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "recorder": self.test_new_recorder.user_id,
            "event_tasks": self.task2.task_number,
            "tcs_location": self.tcs_location.abbreviation,
        }

        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        event_tasks = EventTasks.objects.filter(event=self.test_event)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(event_tasks.count(), 1)

    @tag("validation")
    def test_edit_event_add_multiple_valid_tasks(self):
        """
        Checks that editing an event with one associated task and adding multiple valid tasks is successful
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "recorder": self.test_new_recorder.user_id,
            "event_tasks": [self.task.task_number, self.task2.task_number],
        }

        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        event_tasks = EventTasks.objects.filter(event=self.test_event)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(event_tasks.count(), 2)

    @tag("validation")
    def test_edit_event_add_invalid_task(self):
        """
        Checks that editing an event with one associated task and adding an invalid task
        returns task not found error
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "recorder": self.test_new_recorder.user_id,
            "event_tasks": "NOT" + self.task2.task_number,
        }

        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TASK_DOES_NOT_EXIST)

    @tag("validation")
    def test_edit_event_add_invalid_tasks(self):
        """
        Checks that editing an event with one associated task and adding a valid task and
        another invalid task returns task not found error
        """
        url = reverse("shiny_edit_7817", kwargs={"event_id": self.test_event.id})
        data = {
            "recorder": self.test_new_recorder.user_id,
            "event_tasks": [self.task.task_number, "NOT" + self.task2.task_number],
        }

        response = self.client.put(
            url,
            data,
            headers={"X-On-Behalf-Of": self.test_user.user_id},
            content_type=self.json_content,
        )

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TASK_DOES_NOT_EXIST)
