from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.models import Equipment, UnitEquipment, EquipmentModel
from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    get_default_bottom_unit,
    get_default_top_unit,
    create_single_test_equipment,
    create_single_equipment_model,
)
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST,
)


@tag("aircraft", "create", "equipment")
class EquipmentCreateTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_uint = get_default_bottom_unit()

        self.equipment_model = create_single_equipment_model(name="New Model")

        self.aircraft = create_single_test_aircraft(self.top_unit)
        self.equipment = create_single_test_equipment(
            "TESTEQUIPMENT", self.top_unit, model=self.equipment_model, installed_on_aircraft=self.aircraft
        )

    def test_post_with_invalid_json(self):
        # Remove existing equipment
        Equipment.objects.all().delete()

        new_data = {
            "aircraft": self.aircraft.serial,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.post(
            reverse("create_equipment"),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

        # Assert no Equipment updates were made.
        self.assertEqual(Equipment.objects.count(), 0)

    def test_post_with_invalid_aircraft_serial(self):
        # Remove existing equipment
        Equipment.objects.all().delete()

        new_data = {
            "serial_number": self.equipment.serial_number,
            "model": self.equipment_model.name,
            "aircraft": "NOT" + self.aircraft.serial,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.post(
            reverse("create_equipment"),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

        # Assert no Equipment updates were made.
        self.assertEqual(Equipment.objects.count(), 0)

    def test_post_with_invalid_equipment_model(self):
        # Remove existing equipment
        Equipment.objects.all().delete()

        new_data = {
            "serial_number": self.equipment.serial_number,
            "model": "NOT A MODEL",
            "aircraft": self.aircraft.serial,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.post(
            reverse("create_equipment"),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST)

        # Assert no Equipment updates were made.
        self.assertEqual(Equipment.objects.count(), 0)

    def test_post_with_missing_current_unit(self):
        # Remove existing equipment
        Equipment.objects.all().delete()

        new_data = {
            "serial_number": self.equipment.serial_number,
            "model": self.equipment_model.name,
            "aircraft": self.aircraft.serial,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }
        response = self.client.post(
            reverse("create_equipment"),
            json.dumps(new_data),
            content_type="application/json",
        )

        # Assert no Unit Equipment were created.
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
        self.assertEqual(Equipment.objects.count(), 0)
        self.assertEqual(UnitEquipment.objects.count(), 0)

    def test_post_with_invalid_unit(self):
        # Remove existing equipment
        Equipment.objects.all().delete()

        new_data = {
            "serial_number": self.equipment.serial_number,
            "aircraft": self.aircraft.serial,
            "model": self.equipment_model.name,
            "current_unit": "NOT" + self.top_unit.uic,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }
        response = self.client.post(
            reverse("create_equipment"),
            json.dumps(new_data),
            content_type="application/json",
        )

        # Assert no Unit Equipment were created.
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
        self.assertEqual(Equipment.objects.count(), 0)
        self.assertEqual(UnitEquipment.objects.count(), 0)

    def test_post_with_valid_data(self):
        # Remove existing equipment
        Equipment.objects.all().delete()
        UnitEquipment.objects.all().delete()

        create_single_equipment_model(name="Newest Model")

        new_data = {
            "serial_number": self.equipment.serial_number,
            "model": "Newest Model",
            "aircraft": self.aircraft.serial,
            "current_unit": self.top_unit.uic,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.post(
            reverse("create_equipment"),
            json.dumps(new_data),
            content_type="application/json",
        )

        # Assert Equipment creation was successful.
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Equipment creation successful.")
        self.assertEqual(Equipment.objects.count(), 1)
        self.assertEqual(UnitEquipment.objects.count(), 1)
