import json
from http import HTTPStatus

from django.forms.models import model_to_dict
from django.test import TestCase, tag
from django.urls import reverse
from personnel.model_utils import MosCode
from personnel.models import SoldierAdditionalMOS
from utils.http.constants import CONTENT_TYPE_JSON, HTTP_404_SOLDIER_DOES_NOT_EXIST
from utils.tests import (
    create_test_soldier,
    create_test_unit,
    create_test_mos_code,
    create_test_additional_soldier_mos,
)


@tag("api", "personnel", "update_soldier_info")
class UpdateSoldierInfoTestCase(TestCase):
    """Update Soldier Info Test Cases"""

    _update_url = "personnel:update_soldier_info"
    maxDiff = None

    def setUp(self):
        self.unit = create_test_unit()
        self.unit_payload = model_to_dict(self.unit)
        self.soldier = create_test_soldier(unit=self.unit)
        self.additional_mos = create_test_mos_code(mos="15U", mos_description="UH-47 Repairer")
        self.soldier_additional_mos = create_test_additional_soldier_mos(self.soldier, self.additional_mos)
        self.update_payload = {
            "pv2_dor": "2018-10-01",
            "pfc_dor": "2019-10-01",
            "spc_dor": "2020-10-01",
            "sgt_dor": "2021-10-01",
            "ssg_dor": "2022-10-01",
            "sfc_dor": "2023-10-01",
            "primary_mos": create_test_mos_code(str(MosCode.B)).mos,
        }

    def test_update_soldier_info__200_updated(self):
        response = self.client.patch(
            reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
            data=self.update_payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = json.loads(response.content.decode("utf-8"))

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(response_data["primary_mos"], self.update_payload["primary_mos"])

    def test_update_soldier_info__200_partial(self):
        update_payload = {
            "pv2_dor": "2018-10-01",
            "pfc_dor": "2019-10-01",
            "sgt_dor": None,
            "primary_mos": create_test_mos_code(str(MosCode.F.value)).mos,
        }

        response = self.client.patch(
            reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
            data=json.dumps(update_payload),
            content_type=CONTENT_TYPE_JSON,
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)

    def test_update_soldier_info__200_change_additional_mos(self):
        update_payload = {
            "pv2_dor": "2018-10-01",
            "pfc_dor": "2019-10-01",
            "sgt_dor": None,
            "additional_mos": create_test_mos_code(str(MosCode.E.value)).mos,
        }

        response = self.client.patch(
            reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
            data=json.dumps(update_payload),
            content_type=CONTENT_TYPE_JSON,
        )

        # SoldierAdditionalMOS.refresh_from_db()
        soldier_additional_mos = SoldierAdditionalMOS.objects.filter(soldier=self.soldier)

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(len(soldier_additional_mos), 1)
        self.assertEqual(soldier_additional_mos.first().mos.mos, MosCode.E)

    def test_update_soldier_info__404_soldier_not_found(self):
        response = self.client.patch(
            reverse(self._update_url, kwargs={"user_id": "Bad_ID"}),
            data=self.update_payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(HTTPStatus.NOT_FOUND, response.status_code)
        self.assertEqual(HTTP_404_SOLDIER_DOES_NOT_EXIST, response_data)

    def test_update_soldier_info__un_allowed_fields(self):
        payload = {**self.update_payload, "not_allowed_field": "False Value"}
        response = self.client.patch(
            reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
            data=payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(
            HTTPStatus.BAD_REQUEST,
            response.status_code,
        )
        self.assertEqual("not_allowed_field not allowed.", response_data)

    def test_update_soldier_info__400_bad_mos_value(self):
        payload = {**self.update_payload, "primary_mos": "NOT_A_VALUE"}
        response = self.client.patch(
            reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
            data=payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertEqual("NOT_A_VALUE not found in MOS Codes", response_data)

    def test_update_soldier_info__400_bad_pv2_dor_value(self):
        payload = {**self.update_payload, "pv2_dor": "NOT_A_DATE"}
        response = self.client.patch(
            reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
            data=payload,
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertEqual("time data 'NOT_A_DATE' does not match format '%Y-%m-%d'", response_data)

    def test_update_soldier_info__403_forbidden(self):
        http_options = {
            "path": reverse(self._update_url, kwargs={"user_id": self.soldier.user_id}),
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
