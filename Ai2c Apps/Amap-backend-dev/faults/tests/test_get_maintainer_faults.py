from datetime import datetime, timedelta

from django.test import TestCase, tag
from django.urls import reverse

from utils.tests import (
    create_test_fault,
    create_test_fault_action,
    create_test_maintainer_fault_action,
    create_test_soldier,
    create_testing_unit,
)


@tag("faults", "get_maintainer_faults")
class GetMaintainerFaultsViewTest(TestCase):
    def setUp(self):
        self.url = "faults:get_maintainer_faults"

        # Create test soldier and unit
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.second_soldier = create_test_soldier(unit=self.unit, user_id="1111111111")

        # Create test fault and fault action
        self.fault = create_test_fault(discovered_by_dodid=self.soldier)
        self.fault_action = create_test_fault_action(associated_fault_id=self.fault)
        self.maintainer_fault_action = create_test_maintainer_fault_action(
            fault_action=self.fault_action, soldier=self.soldier
        )

        # Create start date and end date strings
        self.start_date = (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d")
        self.end_date = (datetime.today() + timedelta(days=1)).strftime("%Y-%m-%d")

    def test_get_maintainer_faults_200(self):
        url = reverse(
            self.url,
            kwargs={
                "user_id": self.soldier.user_id,
                "discovery_start": self.start_date,
                "discovery_end": self.end_date,
            },
        )

        response = self.client.get(url)

        faults = response.json()["faults"]
        fault_actions = response.json()["fault_actions"]

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(faults), 1)
        self.assertEqual(len(fault_actions), 1)
        self.assertEqual(faults[0]["id"], self.fault.id)
        self.assertEqual(fault_actions[0]["id"], self.fault_action.id)

    def test_get_maintainer_faults_invalid_soldier(self):
        url = reverse(
            self.url,
            kwargs={"user_id": "invalid_user_id", "discovery_start": self.start_date, "discovery_end": self.end_date},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_get_maintainer_faults_invalid_date(self):
        url = reverse(
            self.url,
            kwargs={"user_id": self.soldier.user_id, "discovery_start": "invalid_date", "discovery_end": self.end_date},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "Invalid date format. Please use YYYY-MM-DD.")

    def test_get_maintainer_faults_start_date_after_end_date(self):
        url = reverse(
            self.url,
            kwargs={
                "user_id": self.soldier.user_id,
                "discovery_start": self.end_date,
                "discovery_end": self.start_date,
            },
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "Invalid date window - Start Date after End Date.")

    def test_get_maintainer_faults_no_faults(self):
        self.fault.delete()
        self.fault_action.delete()
        # self.maintainer_fault_action.delete()

        url = reverse(
            self.url,
            kwargs={
                "user_id": self.soldier.user_id,
                "discovery_start": self.start_date,
                "discovery_end": self.end_date,
            },
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        faults = response.json()["faults"]
        fault_actions = response.json()["fault_actions"]
        self.assertEqual(len(faults), 0)
        self.assertEqual(len(fault_actions), 0)

    def test_get_maintainer_faults_get_other_soldiers_actions(self):
        create_test_maintainer_fault_action(fault_action=self.fault_action, soldier=self.second_soldier)

        url = reverse(
            self.url,
            kwargs={
                "user_id": self.soldier.user_id,
                "discovery_start": self.start_date,
                "discovery_end": self.end_date,
            },
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        faults = response.json()["faults"]
        fault_actions = response.json()["fault_actions"]
        self.assertEqual(len(faults), 1)
        self.assertEqual(len(fault_actions), 2)
