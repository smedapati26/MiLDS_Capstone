from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from aircraft.models import Equipment
from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    get_default_bottom_unit,
    get_default_top_unit,
    create_single_test_equipment,
    create_single_equipment_model,
)
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST,
)


@tag("aircraft", "delete", "equipment")
class EquipmentDeleteTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_uint = get_default_bottom_unit()

        self.equipment_model = create_single_equipment_model(name="New Model")

        self.aircraft = create_single_test_aircraft(self.top_unit)
        self.equipment = create_single_test_equipment(
            "TESTEQUIPMENT", self.top_unit, model=self.equipment_model, installed_on_aircraft=self.aircraft
        )

    def test_delete_with_non_existing_equipment(self):
        response = self.client.delete(reverse("delete_equipment", kwargs={"equipment_id": 51198}))

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST)

    def test_delete_with_existing_equipment(self):
        response = self.client.delete(reverse("delete_equipment", kwargs={"equipment_id": self.equipment.id}))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Equipment deleted.")
        self.assertEqual(Equipment.objects.count(), 0)
