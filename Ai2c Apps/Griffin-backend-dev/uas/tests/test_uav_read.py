import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_uav,
    create_test_location,
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("uas", "read", "uav")
class TestUAVViews(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.location = create_test_location()

        self.uav = create_single_test_uav(self.top_unit)

    def test_get_with_invalid_uav_serial(self):
        response = self.client.get(
            reverse("read_uav", kwargs={"uav_id": 99 + self.uav.id}),
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST)

    def test_get_with_valid_uav_id(self):
        expected_data = {
            "id": self.uav.id,
            "serial_number": self.uav.serial_number,
            "model": self.uav.model,
            "status": str(self.uav.status),
            "rtl": self.uav.rtl,
            "current_unit": self.top_unit.uic,
            "total_airframe_hours": self.uav.total_airframe_hours,
            "flight_hours": self.uav.flight_hours,
            "location": self.uav.location,
            "remarks": self.uav.remarks,
            "date_down": self.uav.date_down,
            "ecd": self.uav.ecd,
            "last_sync_time": self.uav.last_sync_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "last_update_time": self.uav.last_update_time.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        }

        response = self.client.get(
            reverse("read_uav", kwargs={"uav_id": self.uav.id}),
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)
