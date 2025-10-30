from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from utils.tests import create_test_taskforce, create_test_units, get_default_bottom_unit, get_default_top_unit


class ListTaskForcesTestCase(APITestCase):
    def setUp(self):
        """
        Create some TaskForce instances for testing.
        """
        create_test_units()

        self.unit_1 = get_default_top_unit()

        self.unit_2 = get_default_bottom_unit()

        self.task_force_1 = create_test_taskforce(uic=self.unit_1)

        self.task_force_2 = create_test_taskforce(uic=self.unit_2)

    def test_list_task_force_uics(self):
        """
        Ensure the endpoint lists all Task Force UICs correctly.
        """
        url = reverse("list-task-force-uics")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert the UICs in the response
        uics = [taskforce["uic"] for taskforce in response.data]
        self.assertIn("TSUNFF", uics)
        self.assertIn("TEST000A0", uics)
