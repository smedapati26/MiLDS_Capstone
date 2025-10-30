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


@tag("faults", "get_earliest_maintainer_fault")
class GetEarliestMaintainerFaultViewTest(TestCase):
    def setUp(self):
        self.url = "faults:get_earliest_maintainer_fault"

        # Create test soldier and unit
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)

        # Create test fault and fault action
        self.fault = create_test_fault()
        self.fault_action = create_test_fault_action(associated_fault_id=self.fault)
        self.maintainer_fault_action = create_test_maintainer_fault_action(
            fault_action=self.fault_action, soldier=self.soldier
        )

        # Create another fault with an earlier discovery date
        self.earlier_fault = create_test_fault(
            id="TEST_13_1_ID_0001", discovery_date_time=datetime.today() - timedelta(days=1)
        )
        self.earlier_fault_action = create_test_fault_action(
            id="TEST_13_2_ID_0001", associated_fault_id=self.earlier_fault
        )
        self.earlier_maintainer_fault_action = create_test_maintainer_fault_action(
            fault_action=self.earlier_fault_action, soldier=self.soldier
        )

    def test_get_earliest_maintainer_fault_invalid_soldier(self):
        url = reverse(self.url, kwargs={"user_id": "invalid_user_id"})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_get_earliest_maintainer_fault_earliest_fault(self):
        url = reverse(self.url, kwargs={"user_id": self.soldier.user_id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertAlmostEqual(
            datetime.strptime(
                response.json()["earliest_fault_date"].replace("Z", ""), "%Y-%m-%dT%H:%M:%S.%f"
            ).timestamp(),
            self.earlier_fault.discovery_date_time.timestamp(),
            places=0,
        )

    def test_get_earliest_maintainer_fault_no_faults(self):
        self.fault.delete()
        self.fault_action.delete()
        self.maintainer_fault_action.delete()
        self.earlier_fault.delete()
        self.earlier_fault_action.delete()
        self.earlier_maintainer_fault_action.delete()

        url = reverse(self.url, kwargs={"user_id": self.soldier.user_id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertAlmostEqual(
            datetime.strptime(response.json()["earliest_fault_date"], "%Y-%m-%dT%H:%M:%S.%f").timestamp(),
            datetime.today().timestamp(),
            places=0,
        )
