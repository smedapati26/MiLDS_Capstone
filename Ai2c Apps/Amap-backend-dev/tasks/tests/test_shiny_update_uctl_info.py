"""Update UCTL Info Test Cases"""

import json
from http import HTTPStatus

from django.forms.models import model_to_dict
from django.test import TestCase, tag
from django.urls import reverse

from personnel.model_utils import MosCode
from tasks.models import Ictl, MosIctls
from utils.http.constants import CONTENT_TYPE_JSON, HTTP_404_ICTL_DOES_NOT_EXIST, HTTP_404_UNIT_DOES_NOT_EXIST
from utils.tests import create_test_ictl, create_test_mos, create_test_mos_ictl, create_testing_unit


@tag("api", "tasks", "update_uctl_info")
class UpdateUCTLInfoTestCase(TestCase):
    """Update UCTL Info Test Cases"""

    _update_url = "tasks:shiny_update_uctl_info"
    maxDiff = None

    def setUp(self):
        self.unit = create_testing_unit()
        self.unit_payload = model_to_dict(self.unit)
        self.new_unit = create_testing_unit(uic="TEST000A0")
        self.uctl = create_test_ictl(unit=self.unit)
        self.uctl_payload = model_to_dict(self.uctl)
        self.mos_15T = create_test_mos()
        self.mos_15U = create_test_mos("15U")
        self.mos_15B = create_test_mos("15B")
        self.mos_15M = create_test_mos("15M")
        self.ictl_mos = create_test_mos_ictl(mos=self.mos_15T, ictl=self.uctl)
        self.update_payload = {
            "ctl_title": "New ICTL Title",
            "ctl_unit_uic": str(self.new_unit.uic),
            "skill_level": "SL2",
            "mos_list": [MosCode.T, MosCode.B],
            "target_audience": "SL1 Soldier in TEST000A0",
        }

    def test_update_uctl_info__200_updated(self):
        response = self.client.patch(
            reverse(self._update_url, kwargs={"uctl_id": self.uctl.ictl_id}),
            data=self.update_payload,
            content_type=CONTENT_TYPE_JSON,
        )
        self.uctl.refresh_from_db()
        new_mos = MosIctls.objects.filter(ictl=self.uctl)

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(self.update_payload["ctl_title"], self.uctl.ictl_title)
        self.assertEqual(self.update_payload["ctl_unit_uic"], self.new_unit.uic)
        self.assertEqual(self.update_payload["skill_level"], self.uctl.skill_level)
        self.assertEqual(len(new_mos), 2)
        self.assertEqual(self.update_payload["target_audience"], self.uctl.target_audience)

    def test_update_uctl_info__200_partial(self):
        update_payload = {
            "ctl_title": "New ICTL Title",
            "ctl_unit_uic": str(self.new_unit.uic),
            "target_audience": "SL1 Soldier in TEST000A0",
        }

        response = self.client.patch(
            reverse(self._update_url, kwargs={"uctl_id": self.uctl.ictl_id}),
            data=json.dumps(update_payload),
            content_type=CONTENT_TYPE_JSON,
        )

        self.uctl.refresh_from_db()
        new_mos = MosIctls.objects.filter(ictl=self.uctl)

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(self.update_payload["ctl_title"], self.uctl.ictl_title)
        self.assertEqual(self.update_payload["ctl_unit_uic"], self.new_unit.uic)
        self.assertNotEqual(self.update_payload["skill_level"], self.uctl.skill_level)
        self.assertEqual(len(new_mos), 1)
        self.assertEqual(self.update_payload["target_audience"], self.uctl.target_audience)

    def test_update_uctl_info__200_partial_with_invalid_mos(self):
        update_payload = {
            "ctl_title": "New ICTL Title",
            "ctl_unit_uic": str(self.new_unit.uic),
            "mos_list": [MosCode.T, MosCode.B, "INVALID"],
            "target_audience": "SL1 Soldier in TEST000A0",
        }

        response = self.client.patch(
            reverse(self._update_url, kwargs={"uctl_id": self.uctl.ictl_id}),
            data=json.dumps(update_payload),
            content_type=CONTENT_TYPE_JSON,
        )

        self.uctl.refresh_from_db()
        new_mos = MosIctls.objects.filter(ictl=self.uctl)

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(len(new_mos), 2)

    def test_update_uctl_info__404_ictl_not_found(self):
        response = self.client.patch(
            reverse(self._update_url, kwargs={"uctl_id": 2222222}),
            data=self.update_payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(HTTPStatus.NOT_FOUND, response.status_code)
        self.assertEqual(HTTP_404_ICTL_DOES_NOT_EXIST, response_data)

    def test_update_uctl_info__404_unit_not_found(self):
        payload = {
            "ctl_title": "New ICTL Title",
            "ctl_unit_uic": "Invalid Unit",
            "skill_level": "SL2",
            "mos_list": [MosCode.T, MosCode.B],
            "target_audience": "SL1 Soldier in TEST000A0",
        }

        response = self.client.patch(
            reverse(self._update_url, kwargs={"uctl_id": self.uctl.ictl_id}),
            data=json.dumps(payload),
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(HTTPStatus.NOT_FOUND, response.status_code)
        self.assertEqual(HTTP_404_UNIT_DOES_NOT_EXIST, response_data)

    def test_update_uctl_info__un_allowed_fields(self):
        payload = {**self.update_payload, "not_allowed_field": "False Value"}
        response = self.client.patch(
            reverse(self._update_url, kwargs={"uctl_id": self.uctl.ictl_id}),
            data=payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(
            HTTPStatus.BAD_REQUEST,
            response.status_code,
        )
        self.assertEqual("not_allowed_field not allowed.", response_data)

    def test_update_uctl_info__403_forbidden(self):
        http_options = {
            "path": reverse(self._update_url, kwargs={"uctl_id": self.uctl.ictl_id}),
            "data": self.update_payload,
            "content_type": CONTENT_TYPE_JSON,
        }
        # GET - FORBIDDEN
        response = self.client.get(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # POST - FORBIDDEN
        response = self.client.post(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # PUT - FORBIDDEN
        response = self.client.put(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # DELETE - FORBIDDEN
        response = self.client.delete(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
