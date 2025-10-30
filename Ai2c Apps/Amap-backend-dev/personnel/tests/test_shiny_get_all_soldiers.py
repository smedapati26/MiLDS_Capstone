from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from personnel.models import Soldier, UserRole, UserRoleAccessLevel
from utils.http.constants import HTTP_SUCCESS_STATUS_CODE
from utils.tests import create_test_soldier, create_testing_unit


@tag("personnel", "get_all_soldiers")
class GetAllSoldiersTest(TestCase):
    get_soldier_url = "personnel:shiny_get_all_soldiers"

    # Initial setup for the get all maintainers endpoint functionality
    def setUp(self) -> None:
        # Create Units
        self.test_unit = create_testing_unit()
        self.test_unit_2 = create_testing_unit(uic="TEST01AA")
        # Create Maintainer
        self.test_maintainer = create_test_soldier(unit=self.test_unit)
        # Create Non-Maintainer
        self.test_non_maintainer = create_test_soldier(unit=self.test_unit_2, user_id="1111111111", is_maintainer=False)

    @tag("validation")
    def test_get_no_soldiers_if_not_manager(self):
        """
        Checks that all related soldiers are retrieved
        """
        url = reverse(self.get_soldier_url)
        headers = {"X-On-Behalf-Of": "1234567890"}
        response = self.client.get(url, headers=headers)
        all_soldiers = response.json()["soldiers"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(all_soldiers), 0)

    @tag("validation")
    def test_get_all_soldiers_in_managed_units(self):
        """
        Checks that all related soldiers are retrieved
        """
        role = UserRole.objects.create(
            user_id=self.test_maintainer, unit=self.test_unit, access_level=UserRoleAccessLevel.MANAGER
        )
        url = reverse(self.get_soldier_url)
        headers = {"X-On-Behalf-Of": "1234567890"}
        response = self.client.get(url, headers=headers)
        all_soldiers = response.json()["soldiers"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(all_soldiers), 1)

    @tag("validation")
    def test_get_all_soldiers(self):
        """
        Checks that all soldiers are properly retrieved
        """
        url = reverse(self.get_soldier_url)
        headers = {"X-On-Behalf-Of": "1111111111"}
        response = self.client.get(url, {"no_really": True}, headers=headers)
        all_soldiers = response.json()["soldiers"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(all_soldiers), Soldier.objects.count())

    @tag("validation")
    def test_get_all_soldiers_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.get_soldier_url, kwargs={})
        # PUT - FORBIDDEN
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # POST - FORBIDDEN
        response = self.client.post(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # DELETE - FORBIDDEN
        response = self.client.delete(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
