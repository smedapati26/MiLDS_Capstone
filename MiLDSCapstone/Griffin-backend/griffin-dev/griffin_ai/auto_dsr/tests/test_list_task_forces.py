from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from utils.tests import (
    create_test_units,
    get_default_top_unit,
    get_default_bottom_unit,
    create_test_taskforce,
)


class ListTaskForcesTestCase(APITestCase):
    def setUp(self):
        """
        Create some TaskForce instances for testing.
        """
        create_test_units()

        self.unit_1 = get_default_top_unit()

        self.unit_2 = get_default_bottom_unit()

        self.tf_1 = create_test_taskforce(uic=self.unit_1)

        self.tf_2 = create_test_taskforce(uic=self.unit_2)

    def test_list_task_forces(self):
        """
        Ensure the endpoint lists all Task Forces data correctly.
        """
        url = reverse("list-task-forces")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Both task force uics in the response
        uics = [(taskforce["uic"], taskforce["start_date"], taskforce["end_date"]) for taskforce in response.data]
        self.assertIn((self.tf_1.uic.uic, self.tf_1.start_date, self.tf_1.end_date), uics)
        self.assertIn((self.tf_2.uic.uic, self.tf_2.start_date, self.tf_2.end_date), uics)
