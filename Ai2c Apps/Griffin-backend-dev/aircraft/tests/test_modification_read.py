import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_applied_modification,
    create_single_test_modification,
    create_test_units,
    get_default_top_unit,
)


@tag("aircraft", "read", "modification")
class ModificationReadTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.aircraft_1 = create_single_test_aircraft(self.top_unit)
        self.aircraft_2 = create_single_test_aircraft(self.top_unit, "TESTAIRCRAFT2")

        self.modification = create_single_test_modification(name="Wings")

    def test_get_with_invalid_modification(self):
        response = self.client.get(reverse("read_modification", kwargs={"name": "DoesNotExist"}))

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    def test_get_with_no_aircraft(self):
        response = self.client.get(reverse("read_modification", kwargs={"name": self.modification.name}))

        expected_data = {
            "applied_to_aircraft": [],
            "name": self.modification.name,
            "type": str(self.modification.type),
        }

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)

    def test_get_with_one_aircraft(self):
        # Create a Applied Modification for this Mod and one Aircraft
        create_single_test_applied_modification(self.modification, self.aircraft_1)

        response = self.client.get(reverse("read_modification", kwargs={"name": self.modification.name}))

        expected_data = {
            "applied_to_aircraft": [self.aircraft_1.serial],
            "name": self.modification.name,
            "type": str(self.modification.type),
        }

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)

    def test_get_with_multiple_aircraft(self):
        # Create a Applied Modification for this Mod and multiple Aircraft
        create_single_test_applied_modification(self.modification, self.aircraft_1)
        create_single_test_applied_modification(self.modification, self.aircraft_2)

        response = self.client.get(reverse("read_modification", kwargs={"name": self.modification.name}))

        expected_data = {
            "applied_to_aircraft": [self.aircraft_1.serial, self.aircraft_2.serial],
            "name": self.modification.name,
            "type": self.modification.type,
        }

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)
