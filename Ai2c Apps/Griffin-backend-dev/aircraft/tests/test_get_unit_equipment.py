import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.models import Equipment
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import (
    create_single_equipment_model,
    create_single_test_aircraft,
    create_single_test_equipment,
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("aircraft", "equipment", "get_unit_equipment")
class GetUnitEquipmentTest(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_unit = get_default_bottom_unit()

        self.equipment_model = create_single_equipment_model(name="New Model")

        self.aircraft_1 = create_single_test_aircraft(self.top_unit)
        self.aricraft_2 = create_single_test_aircraft(self.bottom_unit, serial="TESTAIRCRAFT2")

        self.equipment_1 = create_single_test_equipment(
            serial_number="TestEquipment1",
            current_unit=self.top_unit,
            model=self.equipment_model,
            installed_on_aircraft=self.aircraft_1,
        )
        self.equipment_2 = create_single_test_equipment(
            serial_number="TestEquipment2",
            current_unit=self.top_unit,
            model=self.equipment_model,
            installed_on_aircraft=self.aircraft_1,
        )
        self.equipment_3 = create_single_test_equipment(
            serial_number="TestEquipment3",
            current_unit=self.bottom_unit,
            model=self.equipment_model,
            installed_on_aircraft=self.aricraft_2,
        )

    def test_get_unit_equipment_with_invalid_unit(self):
        resp = self.client.get(reverse("get_unit_equipment", kwargs={"unit_uic": "NOT" + self.top_unit.uic}))

        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_get_unit_equipment_with_no_equipment(self):
        Equipment.objects.all().delete()

        resp = self.client.get(reverse("get_unit_equipment", kwargs={"unit_uic": self.top_unit.uic}))

        expected_data = []
        returned_data = json.loads(resp.content.decode("utf-8"))

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(returned_data, expected_data)

    def test_get_unit_equipment_with_no_unit_hierarchy(self):
        resp = self.client.get(reverse("get_unit_equipment", kwargs={"unit_uic": self.bottom_unit.uic}))

        expected_data = [
            {
                "unit": self.bottom_unit.uic,
                "serial_number": self.equipment_3.serial_number,
                "model": self.equipment_3.model.name,
                "aircraft": self.equipment_3.installed_on_aircraft.serial,
                "status": self.equipment_3.status,
                "date_down": self.equipment_3.date_down,
                "ecd": self.equipment_3.ecd,
                "remarks": self.equipment_3.remarks,
                "id": self.equipment_3.id,
            }
        ]
        returned_data = json.loads(resp.content.decode("utf-8"))

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(returned_data, expected_data)

    def test_get_unit_equipment_with_hierarchy(self):
        resp = self.client.get(reverse("get_unit_equipment", kwargs={"unit_uic": self.top_unit.uic}))

        expected_data = [
            {
                "unit": self.top_unit.uic,
                "serial_number": self.equipment_1.serial_number,
                "model": self.equipment_1.model.name,
                "aircraft": self.equipment_1.installed_on_aircraft.serial,
                "status": self.equipment_1.status,
                "date_down": self.equipment_1.date_down,
                "ecd": self.equipment_1.ecd,
                "remarks": self.equipment_1.remarks,
                "id": self.equipment_1.id,
            },
            {
                "unit": self.top_unit.uic,
                "serial_number": self.equipment_2.serial_number,
                "model": self.equipment_2.model.name,
                "aircraft": self.equipment_2.installed_on_aircraft.serial,
                "status": self.equipment_2.status,
                "date_down": self.equipment_2.date_down,
                "ecd": self.equipment_2.ecd,
                "remarks": self.equipment_2.remarks,
                "id": self.equipment_2.id,
            },
            {
                "unit": self.bottom_unit.uic,
                "serial_number": self.equipment_3.serial_number,
                "model": self.equipment_3.model.name,
                "aircraft": self.equipment_3.installed_on_aircraft.serial,
                "status": self.equipment_3.status,
                "date_down": self.equipment_3.date_down,
                "ecd": self.equipment_3.ecd,
                "remarks": self.equipment_3.remarks,
                "id": self.equipment_3.id,
            },
        ]
        returned_data = json.loads(resp.content.decode("utf-8"))

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(returned_data, expected_data)
