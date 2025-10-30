import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone

from uas.model_utils import UASStatuses
from uas.models import UAC, UnitUAC
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UAS_STATUS_IS_INVALID,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)
from utils.tests import (
    create_single_test_uac,
    create_test_location,
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("uas", "create", "uac")
class UACCreateTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.location = create_test_location()

        self.uac = create_single_test_uac(self.top_unit)

    def test_post_with_invalid_json(self):
        UAC.objects.all().delete()
        UnitUAC.objects.all().delete()

        create_data = {
            "serial_number": self.uac.serial_number,
            "NOT" + "model": self.uac.model,
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "current_unit": self.uac.current_unit.uic,
            "remarks": "New Remark.",
        }

        response = self.client.post(
            reverse("create_uac"),
            json.dumps(create_data),
            "application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

        self.assertEqual(UAC.objects.count(), 0)
        self.assertEqual(UnitUAC.objects.count(), 0)

    def test_post_with_invalid_uas_status(self):
        UAC.objects.all().delete()
        UnitUAC.objects.all().delete()

        create_data = {
            "serial_number": self.uac.serial_number,
            "model": self.uac.model,
            "status": "NOT" + UASStatuses.PMC,
            "rtl": "NRTL",
            "current_unit": self.uac.current_unit.uic,
            "last_sync_time": timezone.now().isoformat(),
            "remarks": "New Remark.",
        }

        response = self.client.post(
            reverse("create_uac"),
            json.dumps(create_data),
            "application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UAS_STATUS_IS_INVALID)

        self.assertEqual(UAC.objects.count(), 0)
        self.assertEqual(UnitUAC.objects.count(), 0)

    def test_post_with_invalid_unit(self):
        UAC.objects.all().delete()
        UnitUAC.objects.all().delete()

        create_data = {
            "serial_number": self.uac.serial_number,
            "model": self.uac.model,
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "current_unit": "NOT" + self.uac.current_unit.uic,
            "last_sync_time": timezone.now().isoformat(),
            "remarks": "New Remark.",
        }

        response = self.client.post(
            reverse("create_uac"),
            json.dumps(create_data),
            "application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

        self.assertEqual(UAC.objects.count(), 0)
        self.assertEqual(UnitUAC.objects.count(), 0)

    def test_post_with_invalid_location(self):
        UAC.objects.all().delete()
        UnitUAC.objects.all().delete()

        create_data = {
            "serial_number": self.uac.serial_number,
            "model": self.uac.model,
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "current_unit": self.top_unit.uic,
            "last_sync_time": timezone.now().isoformat(),
            "remarks": "New Remark.",
            "location": "NOT" + self.location.name,
        }

        response = self.client.post(
            reverse("create_uac"),
            json.dumps(create_data),
            "application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)

        self.assertEqual(UAC.objects.count(), 0)
        self.assertEqual(UnitUAC.objects.count(), 0)

    def test_post_with_valid_data(self):
        UAC.objects.all().delete()
        UnitUAC.objects.all().delete()

        create_data = {
            "serial_number": self.uac.serial_number,
            "model": self.uac.model,
            "status": UASStatuses.PMC,
            "rtl": "NRTL",
            "current_unit": self.uac.current_unit.uic,
            "last_sync_time": timezone.now().isoformat(),
            "remarks": "New Remark.",
            "location": self.location.name,
        }

        response = self.client.post(
            reverse("create_uac"),
            json.dumps(create_data),
            "application/json",
        )

        # self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Successful UAC creation.")

        self.assertEqual(UAC.objects.count(), 1)
        self.assertEqual(UnitUAC.objects.count(), 1)
