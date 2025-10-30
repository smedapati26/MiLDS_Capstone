import json
from http import HTTPStatus

from django.db import connection
from django.test import TestCase
from django.urls import reverse
from ninja.testing import TestClient

from reports.api.dsr_export.routes import dsr_export_router
from utils.http import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)
from utils.tests import create_test_aircraft_in_all, create_test_units, create_test_user


class CreateDSRExportTestCase(TestCase):
    def setUp(self):
        self.units, self.unit_hierarchy = create_test_units()

        self.aircraft = create_test_aircraft_in_all(self.units, num_of_aircraft=9, echelon_dependant=True)

        self.user = create_test_user(self.units[0])
        self.client = TestClient(dsr_export_router, headers={"Auth-User": self.user.user_id})
        # Add missionModsTable to the db because current functionality doesn't use a Django model for this
        with connection.cursor() as cursor:
            cursor.execute("CREATE TABLE missionModsTable AS SELECT serial FROM aircraft;")
            cursor.execute("ALTER TABLE missionModsTable RENAME COLUMN serial to serial_number;")
            cursor.execute("ALTER TABLE missionModsTable ADD test_mod VARCHAR(255);")
        cursor.close()

    def test_create_dsr_for_non_existant_unit(self):

        res = self.client.post("/dsr/create/INVALID", json={})

        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(res.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_create_dsr_with_incorrect_user_id(self):

        response = self.client.post(
            f"/dsr/create/{self.units[0].uic}",
            json={},
            headers={"Auth-User": "INVALID_USER"},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(
            json.loads(response.content.decode("utf-8")), {"error": HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST}
        )

    def test_create_dsr_with_no_user_id(self):

        no_auth_client = TestClient(dsr_export_router)

        response = no_auth_client.post(
            f"/dsr/create/{self.units[0].uic}",
            json={},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content.decode("utf-8")), {"error": HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER}
        )

    def test_create_dsr(self):

        response = self.client.post(
            f"/dsr/create/{self.units[0].uic}",
            data={"pages": ["summary", "details"]},
            headers={"Auth-User": self.user.user_id},
            json={},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
