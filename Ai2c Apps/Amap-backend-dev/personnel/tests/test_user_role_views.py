import json

from django.test import TestCase, tag
from django.urls import reverse

from personnel.model_utils import UserRoleAccessLevel
from personnel.models import Soldier, UserRole
from utils.http.constants import (
    HTTP_404_ROLE_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("personnel", "user_roles")
class UserRoleTests(TestCase):
    json_content = "application/json"
    user_roles_url = "personnel:shiny_user_roles"

    def setUp(self):
        self.unit = create_testing_unit()
        self.test_soldier = create_test_soldier(unit=self.unit)

    # GET tests
    @tag("validation")
    def test_get_user_role(self):
        """
        Test that a valid get request for user roles returns the user's roles
        """
        create_user_role_in_all(self.test_soldier, [self.unit], UserRoleAccessLevel.VIEWER)

        url = reverse(self.user_roles_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.get(url)

        roles = response.json()["roles"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(roles), 1)

    # POST tests
    @tag("validation")
    def test_post_invalid_unit(self):
        """
        Test that a post request with an invalid unit uic returns a not found error
        """
        test_data = {
            "user_id": self.test_soldier.user_id,
            "rank": "SFC",
            "first_name": "Test",
            "last_name": "User",
            "uic": "INVALID",
            "is_admin": False,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }

        url = reverse(self.user_roles_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.post(url, json.dumps(test_data), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_post_existing_user_new_role(self):
        """
        Test that a post request for an existing user and a new role is successful
        """
        test_data = {
            "user_id": self.test_soldier.user_id,
            "rank": "SFC",
            "first_name": "Test",
            "last_name": "User",
            "uic": self.unit.uic,
            "is_admin": False,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }

        url = reverse(self.user_roles_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.post(url, json.dumps(test_data), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(Soldier.objects.count(), 1)

        user_role = UserRole.objects.get(user_id=self.test_soldier.user_id)
        self.assertEqual(user_role.access_level, UserRoleAccessLevel.EVALUATOR)

    @tag("validation")
    def test_post_new_user_new_role(self):
        """
        Test that a post request for a new user creates both the user and the user role
        """
        test_data = {
            "user_id": "1111111111",
            "rank": "CW3",
            "first_name": "Test",
            "last_name": "User",
            "uic": self.unit.uic,
            "is_admin": False,
            "is_maintainer": True,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }

        url = reverse(self.user_roles_url, kwargs={"user_id": "1111111111"})
        response = self.client.post(url, json.dumps(test_data), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(Soldier.objects.count(), 2)

        user_role = UserRole.objects.get(user_id="1111111111")
        self.assertEqual(user_role.access_level, UserRoleAccessLevel.EVALUATOR)

    @tag("validation")
    def test_post_update_existing_role(self):
        """
        Test that a post request to update a current user unit role is successful
        """
        create_user_role_in_all(self.test_soldier, [self.unit], UserRoleAccessLevel.VIEWER)

        test_data = {
            "user_id": self.test_soldier.user_id,
            "rank": "SFC",
            "first_name": "Test",
            "last_name": "User",
            "uic": self.unit.uic,
            "is_admin": False,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }

        url = reverse(self.user_roles_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.post(url, json.dumps(test_data), content_type=self.json_content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(UserRole.objects.count(), 1)

        role = UserRole.objects.get(user_id=self.test_soldier)
        self.assertEqual(role.access_level, UserRoleAccessLevel.EVALUATOR)

    # DELETE tests
    @tag("validation")
    def test_delete_invalid_unit(self):
        """
        Test that a delete request with an invalid unit uic returns not found error
        """
        create_user_role_in_all(self.test_soldier, [self.unit], UserRoleAccessLevel.VIEWER)

        test_data = {
            "user_id": self.test_soldier.user_id,
            "rank": "SFC",
            "first_name": "Test",
            "last_name": "User",
            "uic": "INVALID",
            "is_admin": False,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }

        url = reverse(self.user_roles_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.delete(url, json.dumps(test_data), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_delete_invalid_user(self):
        """
        Test that a delete request with an invalid user id returns a not found error
        """
        create_user_role_in_all(self.test_soldier, [self.unit], UserRoleAccessLevel.VIEWER)

        test_data = {
            "user_id": "NOT" + self.test_soldier.user_id,
            "rank": "SFC",
            "first_name": "Test",
            "last_name": "User",
            "uic": self.unit.uic,
            "is_admin": False,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }

        url = reverse(self.user_roles_url, kwargs={"user_id": "NOT" + self.test_soldier.user_id})
        response = self.client.delete(url, json.dumps(test_data), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_delete_invalid_missing_role(self):
        test_data = {
            "user_id": self.test_soldier.user_id,
            "rank": "SFC",
            "first_name": "Test",
            "last_name": "User",
            "uic": self.unit.uic,
            "is_admin": False,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }

        url = reverse(self.user_roles_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.delete(url, json.dumps(test_data), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_ROLE_DOES_NOT_EXIST)

    @tag("validation")
    def test_delete_existing_role(self):
        create_user_role_in_all(self.test_soldier, [self.unit], UserRoleAccessLevel.VIEWER)

        test_data = {
            "user_id": self.test_soldier.user_id,
            "rank": "SFC",
            "first_name": "Test",
            "last_name": "User",
            "uic": self.unit.uic,
            "is_admin": False,
            "access_level": UserRoleAccessLevel.EVALUATOR,
        }

        url = reverse(self.user_roles_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.delete(url, json.dumps(test_data), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(UserRole.objects.count(), 0)
