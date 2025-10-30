import datetime
from http import HTTPStatus
from typing import Dict, List
from unittest.mock import patch

from django.test import TestCase, tag
from django.urls import reverse
from ninja.testing import TestClient

from forms.model_utils import EvaluationType, EventType
from forms.models import Event, EventTasks
from personnel.api.unit_health.routes import router
from personnel.api.unit_health.schema import EventReportFilters, EventReportSoldierOut
from utils.tests import (
    create_single_test_event,
    create_test_evaluation_type,
    create_test_event_task,
    create_test_event_type,
    create_test_mos_code,
    create_test_soldier,
    create_test_task,
    create_test_training_type,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("unit_health", "get_event_report")
class GetEventReportTestCase(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.unit_health.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    """Get Event Report Test Cases"""

    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit()
        self.unit_1 = create_testing_unit(uic="TESTUNIT1", parent_unit=self.unit)
        self.unit_1_1 = create_testing_unit(uic="TESTUNIT2", parent_unit=self.unit_1)

        self.non_amtp_mos = create_test_mos_code(mos="TSTMOS", mos_description="Test MOS Description", amtp_mos=False)

        self.soldier_1 = create_test_soldier(
            user_id="1234567890", unit=self.unit_1, birth_month="JAN", is_maintainer=True
        )
        self.soldier_may_birth = create_test_soldier(
            unit=self.unit_1, user_id="1234567891", birth_month="MAY", is_maintainer=True
        )
        self.soldier_higher_unit = create_test_soldier(unit=self.unit, user_id="1234567892", is_maintainer=True)
        self.soldier_non_maintainer = create_test_soldier(
            unit=self.unit_1, user_id="1234567893", birth_month="JAN", is_maintainer=False
        )
        self.soldier_non_amtp_mos = create_test_soldier(
            unit=self.unit_1, user_id="1234567894", birth_month="JAN", is_maintainer=True, primary_mos=self.non_amtp_mos
        )

        self.evaluation_event_type = create_test_event_type()
        self.training_event_type = create_test_event_type(event_type=EventType.Training, description="Training Event")

        self.training_type_1 = create_test_training_type()
        self.training_type_2 = create_test_training_type(training_type="Other 2")

        self.annual_evaluation_type = create_test_evaluation_type()
        self.other_evaluation_type = create_test_evaluation_type("Other")

        self.evaluation_event = create_single_test_event(
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2025, 2, 2),
            event_type=self.evaluation_event_type,
            evaluation_type=self.annual_evaluation_type,
        )
        self.other_evaluation_event = create_single_test_event(
            id=2,
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2025, 1, 1),
            event_type=self.training_event_type,
            evaluation_type=self.other_evaluation_type,
        )
        self.old_evaluation_event = create_single_test_event(
            id=3,
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2025, 1, 1),
            event_type=self.evaluation_event_type,
            evaluation_type=self.annual_evaluation_type,
        )
        self.outdated_evaluation_event = create_single_test_event(
            id=4,
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2024, 1, 1),
            event_type=self.evaluation_event_type,
            evaluation_type=self.annual_evaluation_type,
        )
        self.deleted_evaluation_event = create_single_test_event(
            id=5,
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2025, 1, 1),
            event_type=self.evaluation_event_type,
            evaluation_type=self.annual_evaluation_type,
            event_deleted=True,
        )

        self.task = create_test_task()

        self.evaluation_task_1 = create_test_event_task(event=self.evaluation_event, task=self.task)

        self.training_event = create_single_test_event(
            id=6,
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2025, 1, 1),
            event_type=self.training_event_type,
            training_type=self.training_type_1,
        )
        self.other_training_event = create_single_test_event(
            id=7,
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2025, 1, 1),
            event_type=self.training_event_type,
            training_type=self.training_type_2,
        )
        self.old_training_event = create_single_test_event(
            id=8,
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2025, 1, 1),
            event_type=self.training_event_type,
            training_type=self.training_type_1,
        )
        self.outdated_training_event = create_single_test_event(
            id=9,
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2024, 1, 1),
            event_type=self.training_event_type,
            training_type=self.training_type_1,
        )
        self.deleted_training_event = create_single_test_event(
            id=10,
            soldier=self.soldier_1,
            recorded_by=self.soldier_higher_unit,
            uic=self.unit_1,
            date_time=datetime.date(2025, 1, 1),
            event_type=self.training_event_type,
            training_type=self.training_type_1,
            event_deleted=True,
        )

        self.training_task_1 = create_test_event_task(event=self.training_event, task=self.task, id=2)

        for soldier in [
            self.soldier_higher_unit,
            self.soldier_may_birth,
            self.soldier_non_amtp_mos,
            self.soldier_non_maintainer,
        ]:
            evaluation_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2025, 2, 2),
                event_type=self.evaluation_event_type,
                evaluation_type=self.annual_evaluation_type,
            )
            other_evaluation_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2025, 1, 1),
                event_type=self.training_event_type,
                evaluation_type=self.other_evaluation_type,
            )
            old_evaluation_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2025, 1, 1),
                event_type=self.evaluation_event_type,
                evaluation_type=self.annual_evaluation_type,
            )
            outdated_evaluation_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2024, 1, 1),
                event_type=self.evaluation_event_type,
                evaluation_type=self.annual_evaluation_type,
            )
            deleted_evaluation_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2025, 1, 1),
                event_type=self.evaluation_event_type,
                evaluation_type=self.annual_evaluation_type,
                event_deleted=True,
            )

            evaluation_task_1 = create_test_event_task(
                event=evaluation_event, task=self.task, id=EventTasks.objects.count() + 1
            )

            training_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2025, 1, 1),
                event_type=self.training_event_type,
                training_type=self.training_type_1,
            )
            other_training_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2025, 1, 1),
                event_type=self.training_event_type,
                training_type=self.training_type_2,
            )
            old_training_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2025, 1, 1),
                event_type=self.training_event_type,
                training_type=self.training_type_1,
            )
            outdated_training_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2024, 1, 1),
                event_type=self.training_event_type,
                training_type=self.training_type_1,
            )
            deleted_training_event = create_single_test_event(
                id=Event.objects.count() + 1,
                soldier=soldier,
                recorded_by=self.soldier_1,
                uic=self.unit_1,
                date_time=datetime.date(2025, 1, 1),
                event_type=self.training_event_type,
                training_type=self.training_type_1,
                event_deleted=True,
            )

            training_task_1 = create_test_event_task(
                event=training_event, task=self.task, id=EventTasks.objects.count() + 1
            )

        self.request_headers = {"X-On-Behalf-Of": self.soldier_1.user_id}
        self.request_body: EventReportFilters = {
            "unit_uic": self.unit.uic,
            "birth_months": ["JAN", "FEB", "MAR"],
            "start_date": "2025-01-01",
            "end_date": "2026-01-01",
            "completion_types": ["complete"],
            "evaluation_types": ["Annual"],
            "training_types": [self.training_type_1.type],
        }

        self.get_user_id.return_value = self.soldier_1.user_id

        create_user_role_in_all(soldier=self.soldier_1, units=[self.unit])

    def test_unit_does_not_exist(self):
        response = self.client.post(
            f"/unit/DOESNOTEXIST/event_report",
            json=self.request_body,
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)

    def test_unit_with_no_soldiers(self):
        response = self.client.post(
            f"/unit/{self.unit_1_1.uic}/event_report",
            json=self.request_body,
            headers=self.request_headers,
        )

        response_data = response.json()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response_data), 0)

    def test_unit_with_soldiers(self):
        response = self.client.post(
            f"/unit/{self.unit_1.uic}/event_report",
            json=self.request_body,
            headers=self.request_headers,
        )

        response_data: List[Dict[EventReportSoldierOut]] = response.json()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response_data), 1)

        soldier_data: Dict[EventReportSoldierOut] = response_data[0]

        self.assertEqual(soldier_data["soldier_id"], self.soldier_1.user_id)
        self.assertEqual(len(soldier_data["events"]), 2)
        self.assertEqual(len(soldier_data["events"][0]["occurences"]), 2)

    def test_unit_with_subordinate_soldiers(self):
        response = self.client.post(
            f"/unit/{self.unit.uic}/event_report",
            json=self.request_body,
            headers=self.request_headers,
        )

        response_data: List[Dict[EventReportSoldierOut]] = response.json()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response_data), 1)

        soldier_data: Dict[EventReportSoldierOut] = response_data[0]

        self.assertEqual(soldier_data["soldier_id"], self.soldier_1.user_id)
        self.assertEqual(len(soldier_data["events"]), 2)
        self.assertEqual(len(soldier_data["events"][0]["occurences"]), 2)
