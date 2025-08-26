from django.test import TestCase
from django.urls import reverse
from django.db import connection
from http import HTTPStatus
import json

from utils.tests import create_test_units, create_test_aircraft_in_all, create_test_user
from utils.http import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)


class CreateCSVDSRExportTestCase(TestCase):
    def setUp(self):
        self.units, self.unit_hierarchy = create_test_units()

        self.aircraft = create_test_aircraft_in_all(self.units, num_of_aircraft=9, echelon_dependant=True)

        self.user = create_test_user(self.units[0])
        # Add missionModsTable to the db because current functionality doesn't use a Django model for this
        with connection.cursor() as cursor:
            cursor.execute("CREATE TABLE missionModsTable AS SELECT serial FROM aircraft;")
            cursor.execute("ALTER TABLE missionModsTable RENAME COLUMN serial to serial_number;")
            cursor.execute("ALTER TABLE missionModsTable ADD test_mod VARCHAR(255);")
        cursor.close()

    def test_create_dsr_for_non_existant_unit(self):
        url = reverse("create_csv_dsr_export", kwargs={"uic": "INVALID"})

        res = self.client.get(url)

        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(res.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_create_dsr_with_incorrect_user_id(self):
        url = reverse("create_csv_dsr_export", kwargs={"uic": self.units[0].uic})

        response = self.client.get(
            url,
            content_type="application/json",
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id, "User-Agent": "libcurl"},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(
            json.loads(response.content.decode("utf-8")), {"error": HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST}
        )

    def test_create_dsr_with_no_user_id(self):
        url = reverse("create_csv_dsr_export", kwargs={"uic": self.units[0].uic})

        response = self.client.get(url, headers={"User-Agent": "libcurl"})

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content.decode("utf-8")), {"error": HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER}
        )

    def test_create_dsr(self):
        url = reverse("create_csv_dsr_export", kwargs={"uic": self.units[0].uic})

        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTPStatus.OK)
