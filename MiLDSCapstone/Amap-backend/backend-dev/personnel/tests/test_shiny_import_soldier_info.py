"""Import Soldier Info Test Cases"""

import json
from http import HTTPStatus

from django.forms.models import model_to_dict
from django.test import TestCase, tag
from django.urls import reverse
from personnel.model_utils import MaintenanceLevel, MosCode
from utils.http.constants import CONTENT_TYPE_JSON, HTTP_404_SOLDIER_DOES_NOT_EXIST
from utils.tests import create_test_soldier, create_test_unit


@tag("api", "personnel", "import_soldier_info")
class ImportSoldierInfoTestCase(TestCase):
    """Import Soldier Info Test Cases"""

    _update_url = "personnel:import_soldier_info"
    maxDiff = None

    def setUp(self):
        self.unit = create_test_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.soldier_payload = model_to_dict(self.soldier)
        self.update_payload = {
            "pv2_dor": "2018-12-12",
            "pfc_dor": "2019-12-12",
            "spc_dor": "2020-12-12",
            "sgt_dor": "2021-12-12",
            "ssg_dor": "2022-12-12",
            "sfc_dor": "2023-12-12",
        }

    def test_import_soldier_info__200(self):
        response = self.client.post(
            reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
            data=self.update_payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual("Updated Soldier Information", response_data)

    def test_import_soldier_info__404_soldier_not_found(self):
        response = self.client.post(
            reverse(self._update_url, kwargs={"user_id": "Bad_ID"}),
            data=self.update_payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(HTTPStatus.NOT_FOUND, response.status_code)
        self.assertEqual(HTTP_404_SOLDIER_DOES_NOT_EXIST, response_data)

    def test_import_soldier_info__400_bad_pv2_dor_value(self):
        payload = {**self.update_payload, "pv2_dor": "NOT_A_DATE"}
        response = self.client.post(
            reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
            data=payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertEqual("time data 'NOT_A_DATE' does not match format '%Y-%m-%d'", response_data)

    def test_import_soldier_info__403_forbidden(self):
        http_options = {
            "path": reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
            "data": self.update_payload,
            "content_type": CONTENT_TYPE_JSON,
        }
        # GET - FORBIDDEN
        response = self.client.get(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # PATCH - FORBIDDEN
        response = self.client.patch(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # PUT - FORBIDDEN
        response = self.client.put(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # DELETE - FORBIDDEN
        response = self.client.delete(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
