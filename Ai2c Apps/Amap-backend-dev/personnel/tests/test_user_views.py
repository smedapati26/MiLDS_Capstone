import json

from django.test import TestCase, tag
from django.urls import reverse

from personnel.model_utils import MaintenanceLevel, MosCode, Rank
from personnel.models import MOSCode, Soldier
from utils.http.constants import (
    CONTENT_TYPE_JSON,
    HTTP_400_SOLDIER_CREATE_FAILED_ERROR_MESSAGE,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_BAD_SERVER_STATUS_CODE,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import (
    create_single_test_event,
    create_test_additional_soldier_mos,
    create_test_mos_code,
    create_test_soldier,
    create_testing_unit,
)


@tag("personnel", "users")
class UserTests(TestCase):
    json_content = "application/json"
    user_url = "personnel:shiny_user"

    def setUp(self):
        self.unit = create_testing_unit()
        self.new_unit = create_testing_unit(uic="TEST000B0")
        self.primary_mos = create_test_mos_code()
        self.test_soldier = create_test_soldier(unit=self.unit, primary_mos=self.primary_mos)
        self.test_recorder = create_test_soldier(unit=self.unit, user_id="1111111111")
        self.test_eval = create_single_test_event(
            soldier=self.test_soldier, uic=self.unit, recorded_by=self.test_recorder
        )
        self.additional_mos = create_test_mos_code(mos="15U", mos_description="UH-47 Repairer")
        self.new_mos = create_test_mos_code(mos="15B", mos_description="Power Plant Repairer")
        self.soldier_additional_mos = create_test_additional_soldier_mos(self.test_soldier, self.additional_mos)

        self.expected_fields = [
            "user_id",
            "rank",
            "first_name",
            "last_name",
            "display",
            "pv2_dor",
            "pfc_dor",
            "spc_dor",
            "sgt_dor",
            "ssg_dor",
            "sfc_dor",
            "unit_id",
            "dod_email",
            "receive_emails",
            "birth_month",
            "is_admin",
            "is_maintainer",
            "availability_status",
            "primary_mos",
            "primary_ml",
            "all_mos_and_ml",
            "designations",
            "eval_status",
            "arrival_at_unit",
        ]

    # GET tests
    @tag("validation")
    def test_get_user_invalid_id(self):
        """
        Tests that a get request for a soldier with an invalid id returns a
        a not found error
        """
        url = reverse(self.user_url, kwargs={"user_id": "NOT" + self.test_soldier.user_id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation1")
    def test_get_user(self):
        """
        Tests that a get request for a valid soldier returns the expected json response
        """
        url = reverse(self.user_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.get(url, content_type=CONTENT_TYPE_JSON)
        soldier_data = response.json()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(soldier_data["all_mos_and_ml"]), 2)
        self.assertSequenceEqual(set(response.json().keys()), set(self.expected_fields))

    # POST tests
    @tag("validation")
    def test_post_new_user_invalid_unit(self):
        """
        Test that a post request for a new user with invalid unit returns not found error
        """
        new_user = {
            "user_id": "1111111111",
            "rank": "CW3",
            "first_name": "Test",
            "last_name": "User",
            "unit": "NOT" + self.unit.uic,
            "primary_mos": MosCode.T,
            "is_admin": False,
            "is_maintainer": True,
        }

        url = reverse(self.user_url, kwargs={"user_id": "1111111111"})
        response = self.client.post(url, json.dumps(new_user), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_post_new_user_incomplete_fields(self):
        """
        Test that a post request for a new user with missing fields returns correct error
        """
        new_user = {
            "user_id": "1111111111",
            "rank": "CW3",
            "first_name": "Test",
            "last_name": "User",
            "unit": self.unit.uic,
        }

        url = reverse(self.user_url, kwargs={"user_id": "1111111111"})
        response = self.client.post(url, json.dumps(new_user), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_400_SOLDIER_CREATE_FAILED_ERROR_MESSAGE)

    @tag("validation")
    def test_post_new_user_invalid_mos(self):
        """
        Test that a post request for a new user with missing fields returns correct error
        """
        new_user = {
            "user_id": "1111111111",
            "rank": "CW3",
            "first_name": "Test",
            "last_name": "User",
            "unit": self.unit.uic,
            "primary_mos": "ERROR",
            "is_admin": False,
            "is_maintainer": True,
        }

        url = reverse(self.user_url, kwargs={"user_id": "1111111111"})
        response = self.client.post(url, json.dumps(new_user), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_400_SOLDIER_CREATE_FAILED_ERROR_MESSAGE)

    @tag("validation")
    def test_post_new_user(self):
        """
        Test that a post request for a new user succeeds
        """
        new_user = {
            "user_id": "1111111111",
            "rank": "CW3",
            "first_name": "Test",
            "last_name": "User",
            "unit": self.unit.uic,
            "primary_mos": MOSCode.objects.get(mos=MosCode.T).mos,
            "is_admin": False,
            "is_maintainer": True,
        }

        url = reverse(self.user_url, kwargs={"user_id": "1111111111"})
        response = self.client.post(url, json.dumps(new_user), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(Soldier.objects.count(), 2)

    # PUT tests
    @tag("validation")
    def test_put_invalid_existing_user(self):
        """
        Test that a put request for an invalid user returns not found error
        """
        new_user = {
            "user_id": "NOT" + self.test_soldier.user_id,
            "rank": Rank.SSG,
            "first_name": "Test",
            "last_name": "User",
            "unit": self.unit.uic,
        }

        url = reverse(self.user_url, kwargs={"user_id": "NOT" + self.test_soldier.user_id})
        response = self.client.put(url, json.dumps(new_user), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation", "a")
    def test_put_invalid_new_unit(self):
        """
        Test that a put request with an invalid new unit returns not found error
        """
        new_user = {
            "user_id": self.test_soldier.user_id,
            "rank": Rank.SSG,
            "first_name": "Test",
            "last_name": "User",
            "unit": "NOT" + self.unit.uic,
        }

        url = reverse(self.user_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.put(url, json.dumps(new_user), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_put_existing_user_change_fields(self):
        """
        Test that a put request to change a soldiers rank executes correctly
        """
        new_user = {
            "user_id": self.test_soldier.user_id,
            "rank": Rank.SSG,
            "first_name": "New Test",
            "last_name": "New User",
            "unit": self.new_unit.uic,
        }

        url = reverse(self.user_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.put(url, json.dumps(new_user), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

        self.test_soldier.refresh_from_db()

        self.assertEqual(self.test_soldier.rank, Rank.SSG)
        self.assertEqual(self.test_soldier.first_name, "New Test")
        self.assertEqual(self.test_soldier.last_name, "New User")
        self.assertEqual(self.test_soldier.unit, self.new_unit)

    @tag("validation-12")
    def test_put_existing_user_change_all_fields(self):
        """
        Test that a put request to change a soldiers primary mos executes correctly
        """
        new_user = {
            "user_id": self.test_soldier.user_id,
            "rank": Rank.SSG,
            "first_name": "New Test",
            "last_name": "New User",
            "unit": self.new_unit.uic,
            "is_maintainer": False,
            "primary_mos": "15B",
        }

        url = reverse(self.user_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.put(url, json.dumps(new_user), content_type=self.json_content)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

        self.test_soldier.refresh_from_db()

        self.assertEqual(self.test_soldier.is_maintainer, False)
        self.assertEqual(self.test_soldier.primary_mos, self.new_mos)
