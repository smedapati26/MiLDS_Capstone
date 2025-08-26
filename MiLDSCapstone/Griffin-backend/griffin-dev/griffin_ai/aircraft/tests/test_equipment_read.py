from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    get_default_bottom_unit,
    get_default_top_unit,
    create_single_test_equipment,
    create_single_equipment_model,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST


@tag("aircraft", "read", "equipment")
class EquipmentReadTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_uint = get_default_bottom_unit()

        self.equipment_model = create_single_equipment_model(name="New Model")

        self.aircraft = create_single_test_aircraft(self.top_unit)
        self.equipment = create_single_test_equipment(
            "TESTEQUIPMENT", self.top_unit, model=self.equipment_model, installed_on_aircraft=self.aircraft
        )

    def test_get_equipment_view_non_existant_equipment(self):
        response = self.client.get(reverse("read_equipment", kwargs={"equipment_id": 51198}))

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST)

    def test_get_equipment_view_valid_equipment_with_no_aircraft(self):
        self.equipment.installed_on_aircraft = None
        self.equipment.save()

        expected_data = {
            "id": self.equipment.id,
            "serial_number": self.equipment.serial_number,
            "model": self.equipment.model.name,
            "installed_on_aircraft": None,
            "current_unit": self.top_unit.uic,
            "status": str(self.equipment.status),
            "value": self.equipment.value,
            "value_code": str(self.equipment.value_code),
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.get(reverse("read_equipment", kwargs={"equipment_id": self.equipment.id}))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)

    def test_get_equipment_with_valid_equipment_and_assigned_aircraft(self):
        expected_data = {
            "id": self.equipment.id,
            "serial_number": self.equipment.serial_number,
            "model": self.equipment.model.name,
            "installed_on_aircraft": self.equipment.installed_on_aircraft.serial,
            "current_unit": self.top_unit.uic,
            "status": str(self.equipment.status),
            "value": self.equipment.value,
            "value_code": str(self.equipment.value_code),
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.get(reverse("read_equipment", kwargs={"equipment_id": self.equipment.id}))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_data)

        # Assert that the Aircraft Serial is a part of the data passed back
        self.assertEqual(json.loads(response.content)["installed_on_aircraft"], self.aircraft.serial)
