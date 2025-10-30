from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from personnel.model_utils import MosCode
from tasks.models import Ictl, MosIctls
from utils.http.constants import (
    HTTP_404_MOS_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_mos, create_testing_unit


@tag("tasks", "create_ctl")
class CreateCtlTest(TestCase):
    create_ctl_url = "tasks:create_ctl"
    json_content = "application/json"

    def setUp(self):
        self.unit = create_testing_unit()
        self.mos = create_test_mos()
        self.second_mos = create_test_mos("15U")
        self.ctl_data = {
            "ctl_title": "ICTL for 15T SL2 Soldiers",
            "ctl_unit": self.unit.uic,
            "ctl_sl": "SL2",
            "ctl_mos": MosCode.T,
            "ctl_audience": "15T SL2 Soldiers",
        }

    @tag("validation")
    def test_one_mos_ctl(self):
        """
        Checks that a CTL with one MOS is correctly processed
        """
        url = reverse(self.create_ctl_url)

        response = self.client.post(url, content_type=self.json_content, data=self.ctl_data)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(Ictl.objects.all().count(), 1)

    @tag("validation")
    def test_one_mos_ctl_invalid_unit(self):
        """
        Checks that creating a CTL with one MOS and invalid unit UIC returns not found error
        """
        url = reverse(self.create_ctl_url)

        invalid_unit_ctl_data = self.ctl_data
        invalid_unit_ctl_data["ctl_unit"] = "INVALID_UIC"

        response = self.client.post(url, content_type=self.json_content, data=invalid_unit_ctl_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_one_mos_ctl_invalid_mos(self):
        """
        Checks that creating a CTL with one MOS and invalid MOS code returns not found error
        """
        url = reverse(self.create_ctl_url)

        invalid_mos_ctl_data = self.ctl_data
        invalid_mos_ctl_data["ctl_mos"] = "INVALID_MOS"

        response = self.client.post(url, content_type=self.json_content, data=invalid_mos_ctl_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_MOS_DOES_NOT_EXIST)

    @tag("validation")
    def test_multi_mos_ctl(self):
        """
        Checks that a CTL with one MOS is correctly processed
        """
        url = reverse(self.create_ctl_url)

        multi_mos_ctl_data = self.ctl_data
        multi_mos_ctl_data["ctl_mos"] = [MosCode.T, MosCode.U]

        response = self.client.post(url, content_type=self.json_content, data=multi_mos_ctl_data)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(Ictl.objects.all().count(), 1)
        self.assertEqual(MosIctls.objects.all().count(), 2)

    @tag("validation")
    def test_multi_mos_ctl_invalid_mos(self):
        """
        Checks that creating a CTL with multiple MOS and one invalid MOS code
        returns not found error
        """
        url = reverse(self.create_ctl_url)

        invalid_mos_ctl_data = self.ctl_data
        invalid_mos_ctl_data["ctl_mos"] = [MosCode.T, "INVALID_MOS"]

        response = self.client.post(url, content_type=self.json_content, data=invalid_mos_ctl_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_MOS_DOES_NOT_EXIST)

    @tag("validation")
    def test_create_ctl_non_post_request(self):
        """
        Checks that all non-post requests fail and return method not allowed errors
        """
        url = reverse(self.create_ctl_url, kwargs={})
        # PUT - FORBIDDEN
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # GET - FORBIDDEN
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # DELETE - FORBIDDEN
        response = self.client.delete(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
