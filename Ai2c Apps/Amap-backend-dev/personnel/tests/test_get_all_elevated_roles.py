from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from personnel.models import UserRole
from utils.http.constants import HTTP_SUCCESS_STATUS_CODE
from utils.tests import create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("personnel", "get_all_elevated")
class GetElevatedRolesTest(TestCase):
    get_all_elevated_url = reverse("personnel:shiny_get_all_elevated_roles", kwargs={})

    # Initial setup for the get all elevated roles endpoint functionality
    def setUp(self) -> None:
        # Create Units
        self.test_unit_1 = create_testing_unit()
        self.test_unit_2 = create_testing_unit(uic="TESTAA")
        # Create Soldier
        self.test_soldier = create_test_soldier(unit=self.test_unit_1)

    @tag("validation")
    def test_get_all_roles_one_role(self):
        """
        Checks that request returns json with only 1 elevated role in the db
        """
        create_user_role_in_all(self.test_soldier, units=[self.test_unit_1])
        response = self.client.get(self.get_all_elevated_url)
        all_roles = response.json()["roles"]
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(all_roles), UserRole.objects.count())

    @tag("validation")
    def test_get_all_roles_multiple_roles(self):
        """
        Checks that request returns json with only 1 elevated role in the db
        """
        create_user_role_in_all(self.test_soldier, units=[self.test_unit_1, self.test_unit_2])
        response = self.client.get(self.get_all_elevated_url)
        all_roles = response.json()["roles"]
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(all_roles), UserRole.objects.count())

    @tag("validation")
    def test_get_all_roles_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        # PUT - FORBIDDEN
        response = self.client.put(self.get_all_elevated_url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # POST - FORBIDDEN
        response = self.client.post(self.get_all_elevated_url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(self.get_all_elevated_url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # DELETE - FORBIDDEN
        response = self.client.delete(self.get_all_elevated_url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
