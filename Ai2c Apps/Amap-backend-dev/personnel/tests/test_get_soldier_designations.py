from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.soldier_designation.routes import soldier_designation_router
from utils.tests import (
    create_test_designation,
    create_test_mos_code,
    create_test_soldier,
    create_test_soldier_designation,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("personnel", "soldier_designation")
class TestGetSoldierDesignations(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.soldier_designation.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        """Set up test data"""
        self.client = TestClient(soldier_designation_router)

        self.unit = create_testing_unit()

        self.mos = create_test_mos_code()

        self.soldier = create_test_soldier(unit=self.unit, primary_mos=self.mos)

        self.designation_1 = create_test_designation()

        current_date_add_1 = datetime.now(tz=timezone.utc) + timedelta(days=1)
        current_date_minus_1 = datetime.now(tz=timezone.utc) + timedelta(days=-1)

        self.soldier_designation_1 = create_test_soldier_designation(
            soldier=self.soldier, designation=self.designation_1, end_date=current_date_add_1
        )
        self.soldier_designation_2 = create_test_soldier_designation(
            soldier=self.soldier, designation=self.designation_1, end_date=current_date_minus_1
        )
        self.soldier_designation_3 = create_test_soldier_designation(
            soldier=self.soldier,
            designation=self.designation_1,
            end_date=datetime.now(tz=timezone.utc),
            designation_removed=True,
        )

        self.get_user_id.return_value = self.soldier.user_id

        create_user_role_in_all(soldier=self.soldier, units=[self.unit])

    def test_invalid_user_id(self):
        response = self.client.get("/soldier/51198")
        self.assertEqual(response.status_code, 404)

    def test_get_non_current_soldier_designations(self):
        response = self.client.get(f"/soldier/{self.soldier.user_id}?current=False")
        actual_data = response.json()
        expected_data = [
            {
                "id": self.soldier_designation_1.id,
                "designation": self.designation_1.type,
                "unit": None,
                "start_date": self.soldier_designation_1.start_date.strftime("%m/%d/%Y"),
                "end_date": self.soldier_designation_1.end_date.strftime("%m/%d/%Y"),
                "last_modified_by": None,
                "designation_removed": False,
            },
            {
                "id": self.soldier_designation_2.id,
                "designation": self.designation_1.type,
                "unit": None,
                "start_date": self.soldier_designation_2.start_date.strftime("%m/%d/%Y"),
                "end_date": self.soldier_designation_2.end_date.strftime("%m/%d/%Y"),
                "last_modified_by": None,
                "designation_removed": False,
            },
        ]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_get_current_soldier_designations(self):
        response = self.client.get(f"/soldier/{self.soldier.user_id}?current=True")
        actual_data = response.json()
        expected_data = [
            {
                "id": self.soldier_designation_1.id,
                "designation": self.designation_1.type,
                "unit": None,
                "start_date": self.soldier_designation_1.start_date.strftime("%m/%d/%Y"),
                "end_date": self.soldier_designation_1.end_date.strftime("%m/%d/%Y"),
                "last_modified_by": None,
                "designation_removed": False,
            }
        ]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
