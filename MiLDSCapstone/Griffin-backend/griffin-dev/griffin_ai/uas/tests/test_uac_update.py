from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone
from http import HTTPStatus
import json

from uas.model_utils import UASStatuses
from utils.tests import (
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
    create_test_location,
    create_single_test_uac,
)
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST,
)


@tag("uas", "update", "uac")
class UACUpdateTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.location = create_test_location()

        self.uac = create_single_test_uac(self.top_unit)

    def test_put_with_invalid_uac_id(self):
        original_uac = self.uac

        update_data = {
            "model": self.uac.model,
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "uic": self.uac.current_unit.uic,
            "remarks": "New Remark.",
        }

        response = self.client.put(
            reverse("update_uac", kwargs={"uac_id": 99 + self.uac.id}),
            json.dumps(update_data),
            "application/json",
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST)

        self.uac.refresh_from_db()

        self.assertEqual(self.uac, original_uac)

    def test_put_with_invalid_location(self):
        original_uac = self.uac

        update_data = {
            "model": self.uac.model,
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "uic": self.uac.current_unit.uic,
            "remarks": "New Remark.",
            "location": 99 + self.location.id,
        }

        response = self.client.put(
            reverse("update_uac", kwargs={"uac_id": self.uac.id}),
            json.dumps(update_data),
            "application/json",
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)

        self.uac.refresh_from_db()

        self.assertEqual(self.uac, original_uac)

    def test_put_with_valid_data(self):
        time_of_update = timezone.now().replace(microsecond=0)

        new_location = create_test_location("New Location")

        update_data = {
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "remarks": "New Remark.",
            "location": new_location.id,
            "date_down": time_of_update.date().isoformat(),
            "ecd": time_of_update.date().isoformat(),
            "should_sync": False,
        }

        response = self.client.put(
            reverse("update_uac", kwargs={"uac_id": self.uac.id}),
            json.dumps(update_data),
            "application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "UAC update successful.")

        self.uac.refresh_from_db()

        self.assertEqual(self.uac.status, update_data["status"])
        self.assertEqual(self.uac.rtl, update_data["rtl"])
        self.assertEqual(self.uac.remarks, update_data["remarks"])
        self.assertEqual(self.uac.location, new_location)
        self.assertEqual(self.uac.date_down.isoformat(), update_data["date_down"])
        self.assertEqual(self.uac.ecd.isoformat(), update_data["ecd"])
        self.assertEqual(self.uac.last_update_time.replace(microsecond=0), time_of_update)
        self.assertEqual(self.uac.should_sync, update_data["should_sync"])
