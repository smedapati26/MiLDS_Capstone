import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone

from uas.model_utils import UASStatuses
from utils.http.constants import HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_uav,
    create_test_location,
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("uas", "update", "uav")
class TestUAVViews(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.location = create_test_location()

        self.uav = create_single_test_uav(self.top_unit)

    def test_put_with_invalid_uav_serial(self):
        original_uav = self.uav

        update_data = {
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "total_airframe_hours": 125.0,
            "flight_hours": 25.0,
            "remarks": "New Remark.",
        }

        response = self.client.put(
            reverse("update_uav", kwargs={"uav_id": 99 + self.uav.id}),
            json.dumps(update_data),
            "application/json",
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST)

        self.uav.refresh_from_db()

        self.assertEqual(self.uav, original_uav)

    def test_put_with_invalid_location(self):
        original_uav = self.uav

        update_data = {
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "total_airframe_hours": 125.0,
            "flight_hours": 25.0,
            "remarks": "New Remark.",
            "location": 99 + self.location.id,
        }

        response = self.client.put(
            reverse("update_uav", kwargs={"uav_id": self.uav.id}),
            json.dumps(update_data),
            "application/json",
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)

        self.uav.refresh_from_db()

        self.assertEqual(self.uav, original_uav)

    def test_put_with_valid_data(self):
        time_of_update = timezone.now().replace(microsecond=0)

        new_location = create_test_location("New Location")

        update_data = {
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "total_airframe_hours": 125.0,
            "flight_hours": 25.0,
            "remarks": "New Remark.",
            "location": new_location.id,
            "date_down": time_of_update.date().isoformat(),
            "ecd": time_of_update.date().isoformat(),
            "should_sync": False,
        }

        response = self.client.put(
            reverse("update_uav", kwargs={"uav_id": self.uav.id}),
            json.dumps(update_data),
            "application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "UAV update successful.")

        self.uav.refresh_from_db()

        self.assertEqual(self.uav.status, update_data["status"])
        self.assertEqual(self.uav.rtl, update_data["rtl"])
        self.assertEqual(self.uav.total_airframe_hours, update_data["total_airframe_hours"])
        self.assertEqual(self.uav.flight_hours, update_data["flight_hours"])
        self.assertEqual(self.uav.remarks, update_data["remarks"])
        self.assertEqual(self.uav.location, new_location)
        self.assertEqual(self.uav.date_down.isoformat(), update_data["date_down"])
        self.assertEqual(self.uav.ecd.isoformat(), update_data["ecd"])
        self.assertEqual(self.uav.last_update_time.replace(microsecond=0), time_of_update)
        self.assertEqual(self.uav.should_sync, update_data["should_sync"])
