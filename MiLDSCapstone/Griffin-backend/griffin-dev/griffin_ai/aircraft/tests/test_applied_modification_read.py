from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.model_utils import ModificationTypes, EquipmentStatuses
from utils.http import (
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST,
)
from utils.tests import (
    create_test_units,
    get_default_top_unit,
    create_single_test_aircraft,
    create_single_test_modification,
    create_single_test_modification_category,
    create_single_test_applied_modification,
)


@tag("aircraft", "read", "applied_modification")
class ReadAppliedModificationTest(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()
        self.aircraft = create_single_test_aircraft(self.unit)
        self.modification = create_single_test_modification("Wings")
        self.modification_category = create_single_test_modification_category(self.modification)
        self.applied_modification = create_single_test_applied_modification(self.modification, self.aircraft)

        self.applied_modification.other = "Other Data"
        self.applied_modification.save()

    def test_read_applied_modification_with_invalid_modification(self):
        response = self.client.get(
            reverse(
                "read_applied_modification",
                kwargs={"name": "NOT" + self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    def test_read_applied_modification_with_invalid_aircraft_serial(self):
        response = self.client.get(
            reverse(
                "read_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": "NOT" + self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    def test_read_applied_modification_with_no_applied_modifications(self):
        self.applied_modification.delete()

        response = self.client.get(
            reverse(
                "read_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST)

    def test_read_applied_modification_with_valid_status(self):
        self.modification.type = ModificationTypes.STATUS
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.status = EquipmentStatuses.FMC
        self.applied_modification.save()

        expected_response_data = [
            {"modification": self.modification.name, "aircraft": self.aircraft.serial, "status": EquipmentStatuses.FMC}
        ]

        response = self.client.get(
            reverse(
                "read_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content.decode("utf-8")), expected_response_data)

    def test_read_applied_modification_with_valid_install(self):
        self.modification.type = ModificationTypes.INSTALL
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.installed = True
        self.applied_modification.save()

        expected_response_data = [
            {"modification": self.modification.name, "aircraft": self.aircraft.serial, "installed": True}
        ]

        response = self.client.get(
            reverse(
                "read_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content.decode("utf-8")), expected_response_data)

    def test_read_applied_modification_with_valid_count(self):
        self.modification.type = ModificationTypes.COUNT
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.count = 51198
        self.applied_modification.save()

        expected_response_data = [
            {"modification": self.modification.name, "aircraft": self.aircraft.serial, "count": 51198}
        ]

        response = self.client.get(
            reverse(
                "read_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content.decode("utf-8")), expected_response_data)

    def test_read_applied_modification_with_valid_other(self):
        expected_response_data = [
            {"modification": self.modification.name, "aircraft": self.aircraft.serial, "other": "Other Data"}
        ]

        response = self.client.get(
            reverse(
                "read_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content.decode("utf-8")), expected_response_data)

    def test_read_applied_modification_with_valid_category(self):
        self.modification.type = ModificationTypes.CATEGORY
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.category = self.modification_category
        self.applied_modification.save()

        expected_response_data = [
            {
                "modification": self.modification.name,
                "aircraft": self.aircraft.serial,
                "category__value": self.modification_category.value,
            }
        ]

        response = self.client.get(
            reverse(
                "read_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content.decode("utf-8")), expected_response_data)
