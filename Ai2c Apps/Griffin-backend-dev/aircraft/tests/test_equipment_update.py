import json
from datetime import date
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.model_utils import EquipmentStatuses, EquipmentValueCodes
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_EQUIPMENT_STATUS_IS_INVALID,
    HTTP_ERROR_MESSAGE_EQUIPMENT_VALUE_CODE_IS_INVALID,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)
from utils.tests import (
    create_single_equipment_model,
    create_single_test_aircraft,
    create_single_test_equipment,
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("aircraft", "update", "equipment")
class EquipmentUpdateTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_uint = get_default_bottom_unit()

        self.equipment_model = create_single_equipment_model(name="New Model")

        self.aircraft = create_single_test_aircraft(self.top_unit)
        self.equipment = create_single_test_equipment(
            "TESTEQUIPMENT", self.top_unit, model=self.equipment_model, installed_on_aircraft=self.aircraft
        )

    def test_put_with_invalid_equipment_serial(self):
        original_equipment_copy = self.equipment
        new_data = {
            "aircraft": self.equipment.installed_on_aircraft.serial,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.put(
            reverse(
                "update_equipment",
                kwargs={"equipment_id": 51198 + self.equipment.id},
            ),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST)

        # Assert no Equipment updates were made.
        self.equipment.refresh_from_db()

        self.assertEqual(self.equipment, original_equipment_copy)

    def test_put_with_invalid_aircraft_serial(self):
        original_equipment_copy = self.equipment
        new_data = {
            "aircraft": "NOT" + self.equipment.installed_on_aircraft.serial,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.put(
            reverse(
                "update_equipment",
                kwargs={"equipment_id": self.equipment.id},
            ),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

        # Assert no Equipment updates were made.
        self.equipment.refresh_from_db()

        self.assertEqual(self.equipment, original_equipment_copy)

    def test_put_with_invalid_new_unit(self):
        original_equipment_copy = self.equipment
        new_data = {
            "aircraft": self.equipment.installed_on_aircraft.serial,
            "unit": "NOT" + self.bottom_uint.uic,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.put(
            reverse(
                "update_equipment",
                kwargs={"equipment_id": self.equipment.id},
            ),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

        # Assert no Equipment updates were made.
        self.equipment.refresh_from_db()

        self.assertEqual(self.equipment, original_equipment_copy)

    def test_put_with_invalid_equipment_status(self):
        original_equipment_copy = self.equipment
        new_data = {
            "aircraft": self.equipment.installed_on_aircraft.serial,
            "status": "NOT" + self.equipment.status,
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.put(
            reverse(
                "update_equipment",
                kwargs={"equipment_id": self.equipment.id},
            ),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_EQUIPMENT_STATUS_IS_INVALID)

        # Assert no Equipment updates were made.
        self.equipment.refresh_from_db()

        self.assertEqual(self.equipment, original_equipment_copy)

    def test_put_with_invalid_value_code(self):
        original_equipment_copy = self.equipment
        new_data = {
            "aircraft": self.equipment.installed_on_aircraft.serial,
            "status": self.equipment.status,
            "value": self.equipment.value,
            "value_code": "NOT" + self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.put(
            reverse(
                "update_equipment",
                kwargs={"equipment_id": self.equipment.id},
            ),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_EQUIPMENT_VALUE_CODE_IS_INVALID)

        # Assert no Equipment updates were made.
        self.equipment.refresh_from_db()

        self.assertEqual(self.equipment, original_equipment_copy)

    def test_put_with_invalid_equipment_model(self):
        original_equipment_copy = self.equipment
        new_data = {
            "aircraft": self.equipment.installed_on_aircraft.serial,
            "status": self.equipment.status,
            "model": "NOT A MODEL",
            "value": self.equipment.value,
            "value_code": self.equipment.value_code,
            "remarks": self.equipment.remarks,
            "date_down": self.equipment.date_down,
            "ecd": self.equipment.ecd,
        }

        response = self.client.put(
            reverse(
                "update_equipment",
                kwargs={"equipment_id": self.equipment.id},
            ),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST)

        # Assert no Equipment updates were made.
        self.equipment.refresh_from_db()

        self.assertEqual(self.equipment, original_equipment_copy)

    def test_put_with_valid_data(self):
        new_aircraft = create_single_test_aircraft(current_unit=self.top_unit, serial="NEWAIRCRAFT")

        new_data = {
            "aircraft": new_aircraft.serial,
            "unit": self.bottom_uint.uic,
            "model": "New Model",
            "status": EquipmentStatuses.FMC,
            "value": 5.11,
            "value_code": EquipmentValueCodes.HOURS,
            "remarks": "New Remark",
            "date_down": "1998-05-11",
            "ecd": "1998-05-11",
        }

        response = self.client.put(
            reverse(
                "update_equipment",
                kwargs={"equipment_id": self.equipment.id},
            ),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Equipment update successful.")

        # Assert Equipment updates were made.
        self.equipment.refresh_from_db()

        self.assertEqual(self.equipment.installed_on_aircraft.serial, new_aircraft.serial)
        self.assertEqual(self.equipment.current_unit, self.bottom_uint)
        self.assertEqual(self.equipment.model.name, "New Model")
        self.assertEqual(self.equipment.status, "FMC")
        self.assertEqual(self.equipment.value, 5.11)
        self.assertEqual(self.equipment.value_code, "HRS")
        self.assertEqual(self.equipment.remarks, "New Remark")
        self.assertEqual(self.equipment.date_down, date(1998, 5, 11))
        self.assertEqual(self.equipment.ecd, date(1998, 5, 11))
