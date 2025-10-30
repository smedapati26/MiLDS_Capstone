import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.model_utils import ModificationTypes
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_applied_modification,
    create_single_test_modification,
    create_test_units,
    get_default_top_unit,
)


@tag("aircraft", "modification", "get_all_modifications")
class GetModificationCategoriesTest(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.modification = create_single_test_modification(name="Category", type=ModificationTypes.INSTALL)
        self.modification_2 = create_single_test_modification(name="Category 2", type=ModificationTypes.COUNT)
        self.modification_3 = create_single_test_modification(name="Category 3", type=ModificationTypes.OTHER)

        self.aircraft_1 = create_single_test_aircraft(self.unit)
        self.aircraft_2 = create_single_test_aircraft(self.unit, serial="TESTAIRCRAFT2")
        self.aircraft_3 = create_single_test_aircraft(self.unit, serial="TESTAIRCRAFT3")

        create_single_test_applied_modification(
            self.modification, self.aircraft_1, mod_column="installed", mod_value=True
        )
        create_single_test_applied_modification(
            self.modification, self.aircraft_2, mod_column="installed", mod_value=True
        )
        create_single_test_applied_modification(
            self.modification, self.aircraft_3, mod_column="installed", mod_value=False
        )

        create_single_test_applied_modification(
            self.modification_2, self.aircraft_3, mod_column="count", mod_value=51198
        )

    def test_get_all_modifications_with_no_modifications(self):
        self.modification.delete()
        self.modification_2.delete()
        self.modification_3.delete()

        response = self.client.get(reverse("get_all_modifications"))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content.decode("utf-8")), [])

    def test_get_all_modifications_with_valid_data(self):
        response = self.client.get(reverse("get_all_modifications"))

        expected_data = [
            {
                "name": self.modification.name,
                "type": self.modification.type,
            },
            {
                "name": self.modification_2.name,
                "type": self.modification_2.type,
            },
            {
                "name": self.modification_3.name,
                "type": self.modification_3.type,
            },
        ]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)
