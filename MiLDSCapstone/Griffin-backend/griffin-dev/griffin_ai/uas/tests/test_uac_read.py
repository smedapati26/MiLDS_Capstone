from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from utils.tests import (
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
    create_test_location,
    create_single_test_uac,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST


@tag("uas", "read", "uac")
class UACReadTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.location = create_test_location()

        self.uac = create_single_test_uac(self.top_unit)

    def test_get_with_invalid_uac_serial(self):
        response = self.client.get(
            reverse("read_uac", kwargs={"uac_id": 99 + self.uac.id}),
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST)

    def test_get_with_valid_uac_serial(self):
        expected_data = {
            "id": self.uac.id,
            "serial_number": self.uac.serial_number,
            "model": self.uac.model,
            "status": str(self.uac.status),
            "rtl": self.uac.rtl,
            "current_unit": self.top_unit.uic,
            "location": self.uac.location,
            "remarks": self.uac.remarks,
            "date_down": self.uac.date_down,
            "ecd": self.uac.ecd,
            "last_sync_time": self.uac.last_sync_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "last_update_time": self.uac.last_update_time.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        }

        response = self.client.get(
            reverse("read_uac", kwargs={"uac_id": self.uac.id}),
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)
