from datetime import datetime, timedelta

from django.db import connections
from django.test import TestCase, tag
from django.urls import reverse

from faults.models import Fault, FaultAction, MaintainerFaultAction
from utils.tests import (
    create_raw_fault_action_table,
    create_raw_fault_table,
    create_test_raw_fault,
    create_test_raw_fault_action,
    create_test_soldier,
    create_testing_unit,
)


@tag("faults", "transform_faults")
class TransformFaultsTest(TestCase):
    def setUp(self):
        self.url = reverse("faults:vantage_transform_faults")

        # Create test soldier and unit
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.second_soldier = create_test_soldier(unit=self.unit, user_id="1111111111")

        # Create raw fault and raw fault action tables in test db since they are not managed by django
        with connections["default"].cursor() as cursor:
            # Create raw_fault and raw_fault_action db
            cursor.execute(create_raw_fault_table())
            cursor.execute(create_raw_fault_action_table())
            # Populate raw tables with test examples to transform
            sql, params = create_test_raw_fault()
            cursor.execute(sql, params)
            # sql, params = create_test_raw_fault_action()
            # cursor.execute(sql, params)

    def test_get_request_without_filter_date(self):
        # Create default raw fault action
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action()
            cursor.execute(sql, params)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Fault.objects.count(), 1)
        self.assertEqual(FaultAction.objects.count(), 1)
        self.assertEqual(MaintainerFaultAction.objects.count(), 1)

    def test_get_request_with_filter_date(self):
        # Create default raw fault action
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action()
            cursor.execute(sql, params)

        filter_date = "2022-01-01"

        response = self.client.get(self.url, {"filter_date": filter_date})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Fault.objects.count(), 1)
        self.assertEqual(FaultAction.objects.count(), 1)
        self.assertEqual(MaintainerFaultAction.objects.count(), 1)

    def test_get_request_without_filter_date_and_additional_fault_action_soldier(self):
        # Create two fault actions with different maintainers
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action()
            cursor.execute(sql, params)
            sql, params = create_test_raw_fault_action(personnel_dodid=self.second_soldier.user_id)
            cursor.execute(sql, params)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Fault.objects.count(), 1)
        self.assertEqual(FaultAction.objects.count(), 1)
        self.assertEqual(MaintainerFaultAction.objects.count(), 2)

    def test_get_request_with_future_filter_date(self):
        # Create default raw fault action
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action()
            cursor.execute(sql, params)

        tomorrow = datetime.today() + timedelta(days=1)
        filter_date = tomorrow.strftime("%Y-%m-%d")

        response = self.client.get(self.url, {"filter_date": filter_date})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Fault.objects.count(), 0)
        self.assertEqual(FaultAction.objects.count(), 0)
        self.assertEqual(MaintainerFaultAction.objects.count(), 0)

    def test_get_request_without_filter_date_no_matching_soldier(self):
        # Create a raw fault action with a personnel_dodid that doesn't match any soldier
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action(personnel_dodid="non_existent_dodid")
            cursor.execute(sql, params)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(FaultAction.objects.count(), 0)
        self.assertEqual(MaintainerFaultAction.objects.count(), 0)

    def test_get_request_without_filter_date_no_matching_fault(self):
        # Create a raw fault action with an id_13_1 that doesn't match any fault
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action(id_13_1="non_existent_fault_id")
            cursor.execute(sql, params)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(FaultAction.objects.count(), 0)
        self.assertEqual(MaintainerFaultAction.objects.count(), 0)

    def test_get_request_without_filter_date_no_closed_by_soldier(self):
        # Create a raw fault action with a closed_by_dodid that doesn't match any soldier
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action(closed_by_dodid="non_existent_dodid")
            cursor.execute(sql, params)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(FaultAction.objects.count(), 1)
        self.assertEqual(MaintainerFaultAction.objects.count(), 1)
        self.assertIsNone(FaultAction.objects.first().closed_by)

    def test_get_request_without_filter_date_no_technical_inspector_soldier(self):
        # Create a raw fault action with a technical_inspector_dodid that doesn't match any soldier
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action(technical_inspector_dodid="non_existent_dodid")
            cursor.execute(sql, params)
            sql, params = create_test_raw_fault()
            cursor.execute(sql, params)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(FaultAction.objects.count(), 1)
        self.assertEqual(MaintainerFaultAction.objects.count(), 1)
        self.assertIsNone(FaultAction.objects.first().technical_inspector)

    def test_get_request_without_filter_date_no_unit(self):
        # Create a raw fault with a uic that doesn't match any unit
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault(id="TEST_13_1_ID_0001", uic="non_existent_uic")
            cursor.execute(sql, params)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Fault.objects.filter(id="TEST_13_1_ID_0001").exists(), True)
        self.assertIsNone(Fault.objects.get(id="TEST_13_1_ID_0001").unit)

    def test_get_request_without_filter_date_no_discovered_by_soldier(self):
        # Create a raw fault with an edipi that doesn't match any soldier
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault(id="TEST_13_1_ID_0001", edipi="non_existent_edipi")
            cursor.execute(sql, params)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Fault.objects.filter(id="TEST_13_1_ID_0001").exists(), True)
        self.assertIsNone(Fault.objects.get(id="TEST_13_1_ID_0001").discovered_by_dodid)

    def test_get_request_without_filter_date_fault_action_with_no_maintainer(self):
        # Create a raw fault action with no maintainer
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action(personnel_dodid=None)
            cursor.execute(sql, params)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(FaultAction.objects.count(), 0)
        self.assertEqual(MaintainerFaultAction.objects.count(), 0)

    def test_get_request_without_filter_date_fault_action_with_no_fault(self):
        # Create a raw fault action with no fault
        with connections["default"].cursor() as cursor:
            sql, params = create_test_raw_fault_action(id_13_1=None)
            cursor.execute(sql, params)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(FaultAction.objects.count(), 0)
        self.assertEqual(MaintainerFaultAction.objects.count(), 0)
