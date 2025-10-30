from datetime import date
from unittest.mock import patch

from django.test import TestCase
from ninja.errors import HttpError
from ninja.testing import TestClient

from forms.api.events.routes import router
from forms.models import EventType, TrainingType
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit


class TestMassTrainingEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(uic="W12345", short_name="Test Unit", display_name="Test Unit Display")
        self.event_type = EventType.objects.create(type="Training", description="Training Event")
        self.training_type = TrainingType.objects.create(type="GroupTraining", description="Group Training")
        self.mos_code = create_test_mos_code()
        self.soldier1 = create_test_soldier(
            unit=self.parent_unit, user_id="1234567890", first_name="John", last_name="Doe", primary_mos=self.mos_code
        )
        self.soldier2 = create_test_soldier(
            unit=self.parent_unit, user_id="0987654321", first_name="Jane", last_name="Smith", primary_mos=self.mos_code
        )
        self.recorder = create_test_soldier(
            unit=self.parent_unit,
            user_id="1111111111",
            first_name="Recorder",
            last_name="User",
            primary_mos=self.mos_code,
        )

        self.valid_request_data = {
            "date": date.today().strftime("%Y-%m-%d"),
            "uic": self.parent_unit.uic,
            "event_type": self.event_type.type,
            "training_type": self.training_type.type,
            "comments": "Test group training",
            "recorded_by": self.recorder.user_id,
        }

    @patch("forms.api.events.routes.add_7817")
    def test_successful_mass_training(self, mock_add_7817):
        """Test successful creation of events for multiple soldiers"""
        mock_add_7817.return_value = {"message": "Da7817 Event Record Saved"}

        request_data = {
            **self.valid_request_data,
            "soldiers": [
                {
                    "soldier_id": self.soldier1.user_id,
                    "go_nogo": "GO",
                    "comments": "Soldier 1 comments",
                    "event_tasks": [],
                },
                {
                    "soldier_id": self.soldier2.user_id,
                    "go_nogo": "NOGO",
                    "comments": "Soldier 2 comments",
                    "event_tasks": [],
                },
            ],
        }

        response = self.client.post("/events/mass_training", json=request_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success_count"], 2)
        self.assertEqual(len(response.json()["errors"]), 0)
        self.assertEqual(mock_add_7817.call_count, 2)

        args1, _ = mock_add_7817.call_args_list[0]
        self.assertEqual(args1[1], self.soldier1.user_id)

        args2, _ = mock_add_7817.call_args_list[1]
        self.assertEqual(args2[1], self.soldier2.user_id)

    @patch("forms.api.events.routes.add_7817")
    def test_partial_success_with_errors(self, mock_add_7817):
        """Test scenario where some records succeed and some fail"""

        def side_effect(request, user_id, data):
            if user_id == self.soldier1.user_id:
                return {"message": "Da7817 Event Record Saved"}
            else:
                raise HttpError(404, "Soldier not found")

        mock_add_7817.side_effect = side_effect

        request_data = {
            **self.valid_request_data,
            "soldiers": [
                {
                    "soldier_id": self.soldier1.user_id,
                    "go_nogo": "GO",
                    "comments": "Soldier 1 comments",
                    "event_tasks": [],
                },
                {
                    "soldier_id": self.soldier2.user_id,
                    "go_nogo": "NOGO",
                    "comments": "Soldier 2 comments",
                    "event_tasks": [],
                },
            ],
        }

        response = self.client.post("/events/mass_training", json=request_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success_count"], 1)
        self.assertEqual(len(response.json()["errors"]), 1)
        self.assertEqual(response.json()["errors"][0]["soldier_id"], self.soldier2.user_id)

        self.assertEqual(mock_add_7817.call_count, 2)

    @patch("forms.api.events.routes.add_7817")
    def test_with_unexpected_exception(self, mock_add_7817):
        """Test handling of unexpected exceptions"""
        mock_add_7817.side_effect = Exception("Unexpected error occurred")

        request_data = {
            **self.valid_request_data,
            "soldiers": [
                {
                    "soldier_id": self.soldier1.user_id,
                    "go_nogo": "GO",
                    "comments": "Soldier 1 comments",
                    "event_tasks": [],
                }
            ],
        }

        response = self.client.post("/events/mass_training", json=request_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success_count"], 0)
        self.assertEqual(len(response.json()["errors"]), 1)
        self.assertTrue("Unexpected error" in response.json()["errors"][0]["error"])

        mock_add_7817.assert_called_once()

    def test_with_empty_soldier_list(self):
        """Test behavior with empty soldier list"""
        request_data = {**self.valid_request_data, "soldiers": []}

        response = self.client.post("/events/mass_training", json=request_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success_count"], 0)
        self.assertEqual(len(response.json()["errors"]), 0)

    def test_with_event_tasks(self):
        """Test with event tasks in the request"""
        with patch("forms.api.events.routes.add_7817") as mock_add_7817:
            mock_add_7817.return_value = {"message": "Da7817 Event Record Saved"}

            request_data = {
                **self.valid_request_data,
                "soldiers": [
                    {
                        "soldier_id": self.soldier1.user_id,
                        "go_nogo": "GO",
                        "comments": "Soldier 1 comments",
                        "event_tasks": [
                            {"number": "TASK-001", "name": "Test Task 1", "go_nogo": "GO"},
                            {"number": "TASK-002", "name": "Test Task 1", "go_nogo": "NOGO"},
                        ],
                    }
                ],
            }

            response = self.client.post("/events/mass_training", json=request_data)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["success_count"], 1)

            # Check that the event_tasks were passed correctly
            args, _ = mock_add_7817.call_args
            data = args[2]

            self.assertEqual(len(data.event_tasks), 2)
            self.assertEqual(data.event_tasks[0].number, "TASK-001")
            self.assertEqual(data.event_tasks[0].go_nogo, "GO")
            self.assertEqual(data.event_tasks[1].number, "TASK-002")
            self.assertEqual(data.event_tasks[1].go_nogo, "NOGO")
