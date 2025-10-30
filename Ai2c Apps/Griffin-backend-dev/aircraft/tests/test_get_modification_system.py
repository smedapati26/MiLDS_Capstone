import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.model_utils import EquipmentStatuses, ModificationTypes
from aircraft.models import Aircraft
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_applied_modification,
    create_single_test_modification,
    create_single_test_modification_category,
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("aircraft", "modification", "modification_category", "applied_modification", "modification_system")
class GetModficationSystemTest(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_unit = get_default_bottom_unit()

        self.aircraft_1 = create_single_test_aircraft(self.top_unit)
        self.aircraft_2 = create_single_test_aircraft(self.top_unit, serial="TESTAIRCRAFT2")
        self.aircraft_3 = create_single_test_aircraft(self.top_unit, serial="TESTAIRCRAFT3")

        self.aircraft_4 = create_single_test_aircraft(self.bottom_unit, serial="TESTAIRCRAFT4")
        self.aircraft_5 = create_single_test_aircraft(self.bottom_unit, serial="TESTAIRCRAFT5")

        self.modification_1 = create_single_test_modification("Wings", type=ModificationTypes.COUNT)
        self.modification_2 = create_single_test_modification("Special", type=ModificationTypes.CATEGORY)

        self.modification_category_1 = create_single_test_modification_category(
            self.modification_2, value="Not Really Special"
        )
        self.modification_category_2 = create_single_test_modification_category(
            self.modification_2, value="Definitely Special"
        )

        self.applied_mod_1 = create_single_test_applied_modification(self.modification_1, self.aircraft_1, "count", 3)
        self.applied_mod_2 = create_single_test_applied_modification(self.modification_1, self.aircraft_2, "count", 4)
        self.applied_mod_3 = create_single_test_applied_modification(self.modification_1, self.aircraft_3, "count", 3)

        self.applied_mod_4 = create_single_test_applied_modification(
            self.modification_2, self.aircraft_1, "category", self.modification_category_1
        )
        self.applied_mod_5 = create_single_test_applied_modification(
            self.modification_2, self.aircraft_3, "category", self.modification_category_2
        )

        self.applied_mod_6 = create_single_test_applied_modification(self.modification_1, self.aircraft_4, "count", 8)
        self.applied_mod_7 = create_single_test_applied_modification(self.modification_1, self.aircraft_5, "count", 1)

        self.applied_mod_8 = create_single_test_applied_modification(
            self.modification_2, self.aircraft_4, "category", self.modification_category_2
        )

        self.all_modification_values = [
            {"name": self.modification_1.name, "type": self.modification_1.type},
            {
                "name": self.modification_2.name,
                "type": ", ".join([self.modification_category_1.value, self.modification_category_2.value]),
            },
        ]

    def test_get_modification_system_with_invalid_unit_uic(self):
        response = self.client.get(reverse("get_modification_system", kwargs={"unit_uic": "NOT" + self.top_unit.uic}))

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_get_modification_system_with_no_unit_aircraft(self):
        Aircraft.objects.all().delete()

        resopnse = self.client.get(reverse("get_modification_system", kwargs={"unit_uic": self.top_unit.uic}))

        actual_data = json.loads(resopnse.content.decode("utf-8"))
        acutal_modification_data = actual_data["modification_data"]
        actual_unit_modification_data = actual_data["unit_modification_data"]

        expected_data = {"modification_data": self.all_modification_values, "unit_modification_data": []}
        expected_modification_data = expected_data["modification_data"]
        expected_unit_modification_data = expected_data["unit_modification_data"]

        self.assertEqual(resopnse.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
        self.assertEqual(len(acutal_modification_data), len(expected_modification_data))
        self.assertCountEqual(actual_unit_modification_data, expected_unit_modification_data)

    def test_get_modification_system_with_simple_system_with_sub_units_and_status_modification(self):
        # Remove one moidification to generate a simple modification system.
        self.modification_2.delete()
        # Update existing modification category and effected applied modifications to be for an Other.
        self.modification_1.type = ModificationTypes.STATUS
        self.modification_1.save()
        self.applied_mod_1.status = EquipmentStatuses.FMC
        self.applied_mod_1.save()
        self.applied_mod_2.status = EquipmentStatuses.NMC
        self.applied_mod_2.save()
        self.applied_mod_3.status = EquipmentStatuses.NMCM
        self.applied_mod_3.save()
        self.applied_mod_6.status = EquipmentStatuses.PMC
        self.applied_mod_6.save()
        self.applied_mod_7.status = EquipmentStatuses.UNK
        self.applied_mod_7.save()

        new_all_modification_values = [
            {"name": self.modification_1.name, "type": self.modification_1.type},
        ]

        response = self.client.get(reverse("get_modification_system", kwargs={"unit_uic": self.top_unit.uic}))

        actual_data = json.loads(response.content.decode("utf-8"))
        acutal_modification_data = actual_data["modification_data"]
        actual_unit_modification_data = actual_data["unit_modification_data"]

        expected_data = {
            "modification_data": new_all_modification_values,
            "unit_modification_data": [
                {
                    "name": self.modification_1.name,
                    "type": self.modification_1.type,
                    "values": [
                        self.applied_mod_1.status,
                        self.applied_mod_2.status,
                        self.applied_mod_3.status,
                        self.applied_mod_6.status,
                        self.applied_mod_7.status,
                    ],
                    "serials": [
                        self.aircraft_1.serial,
                        self.aircraft_2.serial,
                        self.aircraft_3.serial,
                        self.aircraft_4.serial,
                        self.aircraft_5.serial,
                    ],
                },
            ],
        }
        expected_modification_data = expected_data["modification_data"]
        expected_unit_modification_data = expected_data["unit_modification_data"]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
        self.assertEqual(len(acutal_modification_data), len(expected_modification_data))
        self.assertCountEqual(actual_unit_modification_data, expected_unit_modification_data)

    def test_get_modification_system_with_simple_system_with_no_sub_units(self):
        # Remove one moidification to generate a simple modification system.
        self.modification_1.delete()

        new_all_modification_values = [
            {
                "name": self.modification_2.name,
                "type": ", ".join([self.modification_category_1.value, self.modification_category_2.value]),
            },
        ]

        response = self.client.get(reverse("get_modification_system", kwargs={"unit_uic": self.bottom_unit.uic}))

        actual_data = json.loads(response.content.decode("utf-8"))
        acutal_modification_data = actual_data["modification_data"]
        actual_unit_modification_data = actual_data["unit_modification_data"]

        expected_data = {
            "modification_data": new_all_modification_values,
            "unit_modification_data": [
                {
                    "name": self.modification_2.name,
                    "type": self.modification_2.type,
                    "values": [
                        self.applied_mod_8.category.value,
                    ],
                    "serials": [self.aircraft_4.serial],
                },
            ],
        }
        expected_modification_data = expected_data["modification_data"]
        expected_unit_modification_data = expected_data["unit_modification_data"]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
        self.assertEqual(len(acutal_modification_data), len(expected_modification_data))
        self.assertCountEqual(actual_unit_modification_data, expected_unit_modification_data)

    @tag("c")
    def test_get_modification_system_with_complex_system_with_sub_units_and_other_modification(self):
        # Update existing modification category and effected applied modifications to be for an Other.
        self.modification_1.type = ModificationTypes.OTHER
        self.modification_1.save()
        self.applied_mod_1.other = "Other 1"
        self.applied_mod_1.save()
        self.applied_mod_2.other = "Other 2"
        self.applied_mod_2.save()
        self.applied_mod_3.other = "Other 3"
        self.applied_mod_3.save()
        self.applied_mod_6.other = "Other 6"
        self.applied_mod_6.save()
        self.applied_mod_7.other = "Other 7"
        self.applied_mod_7.save()

        new_all_modification_values = [
            {"name": self.modification_1.name, "type": self.modification_1.type},
            {
                "name": self.modification_2.name,
                "type": ", ".join([self.modification_category_1.value, self.modification_category_2.value]),
            },
        ]

        response = self.client.get(reverse("get_modification_system", kwargs={"unit_uic": self.top_unit.uic}))

        actual_data = json.loads(response.content.decode("utf-8"))
        acutal_modification_data = actual_data["modification_data"]
        actual_unit_modification_data = actual_data["unit_modification_data"]

        expected_data = {
            "modification_data": new_all_modification_values,
            "unit_modification_data": [
                {
                    "name": self.modification_1.name,
                    "type": self.modification_1.type,
                    "values": [
                        self.applied_mod_1.other,
                        self.applied_mod_2.other,
                        self.applied_mod_3.other,
                        self.applied_mod_6.other,
                        self.applied_mod_7.other,
                    ],
                    "serials": [
                        self.aircraft_1.serial,
                        self.aircraft_2.serial,
                        self.aircraft_3.serial,
                        self.aircraft_4.serial,
                        self.aircraft_5.serial,
                    ],
                },
                {
                    "name": self.modification_2.name,
                    "type": self.modification_2.type,
                    "values": [
                        self.applied_mod_4.category.value,
                        self.applied_mod_5.category.value,
                        self.applied_mod_8.category.value,
                    ],
                    "serials": [self.aircraft_1.serial, self.aircraft_3.serial, self.aircraft_4.serial],
                },
            ],
        }
        expected_modification_data = expected_data["modification_data"]
        expected_unit_modification_data = expected_data["unit_modification_data"]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
        self.assertEqual(len(acutal_modification_data), len(expected_modification_data))
        self.assertCountEqual(actual_unit_modification_data, expected_unit_modification_data)

    def test_get_modification_system_with_complex_system_with_no_sub_units_and_install_modification(self):
        # Update existing modification category and effected applied modifications to be for an Install.
        self.modification_2.type = ModificationTypes.INSTALL
        self.applied_mod_8.installed = False

        self.modification_2.save()
        self.applied_mod_8.save()

        response = self.client.get(reverse("get_modification_system", kwargs={"unit_uic": self.bottom_unit.uic}))

        actual_data = json.loads(response.content.decode("utf-8"))
        acutal_modification_data = actual_data["modification_data"]
        actual_unit_modification_data = actual_data["unit_modification_data"]

        expected_data = {
            "modification_data": self.all_modification_values,
            "unit_modification_data": [
                {
                    "name": self.modification_1.name,
                    "type": self.modification_1.type,
                    "values": [
                        self.applied_mod_6.count,
                        self.applied_mod_7.count,
                    ],
                    "serials": [
                        self.aircraft_4.serial,
                        self.aircraft_5.serial,
                    ],
                },
                {
                    "name": self.modification_2.name,
                    "type": self.modification_2.type,
                    "values": [
                        self.applied_mod_8.installed,
                    ],
                    "serials": [self.aircraft_4.serial],
                },
            ],
        }
        expected_modification_data = expected_data["modification_data"]
        expected_unit_modification_data = expected_data["unit_modification_data"]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
        self.assertEqual(len(acutal_modification_data), len(expected_modification_data))
        self.assertCountEqual(actual_unit_modification_data, expected_unit_modification_data)
