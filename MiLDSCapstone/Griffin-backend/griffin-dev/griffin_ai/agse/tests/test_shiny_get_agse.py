from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from agse.models import AGSE, UnitAGSE
from auto_dsr.models import Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import (
    create_test_units,
    create_test_user,
    get_default_bottom_unit,
    get_default_top_unit,
    create_single_test_agse,
)


@tag("agse", "shiny_get_agse")
class ShinyGetAGSEViewTests(TestCase):
    # Initial setup for Shiny Get AGSE from Task Force endpoint functionality.
    # - creating the needed models
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.user = create_test_user(unit=self.top_unit)

        self.agse = create_single_test_agse(current_unit=self.bottom_unit)

        self.top_agse = create_single_test_agse(current_unit=self.top_unit, equipment_number="TOPAGSE")

        self.bottom_agse = create_single_test_agse(current_unit=self.bottom_unit, equipment_number="BTTMAGSE")

        self.unit_agse = []

        bottom_unit_hierarchy = [self.bottom_unit.uic] + self.bottom_unit.parent_uics

        for unit in Unit.objects.filter(uic__in=bottom_unit_hierarchy):
            self.unit_agse.append(UnitAGSE.objects.create(unit=unit, agse=self.agse))
            self.unit_agse.append(UnitAGSE.objects.create(unit=unit, agse=self.bottom_agse))

        self.top_unit_agse = UnitAGSE.objects.create(unit=self.top_unit, agse=self.top_agse)
        self.unit_agse.append(self.top_unit_agse)

    # Tests for getting Aircraft from Task Force endpoint.
    def test_shiny_get_agse_from_taskforce_with_invalid_task_force_uic(self):
        test_task_force = "NOT" + self.top_unit.uic

        response = self.client.post(
            reverse(
                "shiny_get_agse",
                kwargs={"uic": test_task_force},
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
        )

    def test_shiny_get_agse_from_taskforce_at_top_of_hiearchy(self):
        test_task_force = self.top_unit.uic
        agse_values = [
            "equipment_number",
            "lin",
            "serial_number",
            "condition",
            "current_unit",
            "nomenclature",
            "display_name",
            "earliest_nmc_start",
            "model",
            "days_nmc",
            "remarks",
        ]
        agse = AGSE.objects.all()
        agse_data = list(agse.values(*agse_values))
        sync_fields = ["condition", "earliest_nmc_start", "remarks"]

        syncs = [
        {
            "equipment_number": agse_item.equipment_number,
            **{f"sync_{field}": agse_item.should_sync_field(field) for field in sync_fields}
        }
        for agse_item in agse
        ]
        expected_return_value = {"agse":agse_data, "syncs":syncs}

        response = self.client.post(
            reverse(
                "shiny_get_agse",
                kwargs={"uic": test_task_force},
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            generate_ordered(json.loads(response.content)),
            generate_ordered(expected_return_value),
        )

    def test_shiny_get_agse_from_taskforce_at_bottom_of_hiearchy(self):
        expected_agses = [self.bottom_agse.equipment_number, self.agse.equipment_number]
        agse_values = [
            "equipment_number",
            "lin",
            "serial_number",
            "condition",
            "current_unit",
            "nomenclature",
            "display_name",
            "earliest_nmc_start",
            "model",
            "days_nmc",
            "remarks",
        ]
        agse = AGSE.objects.filter(equipment_number__in=expected_agses)
        agse_data = list(agse.values(*agse_values))
        sync_fields = ["condition", "earliest_nmc_start", "remarks"]

        syncs = [
        {
            "equipment_number": agse_item.equipment_number,
            **{f"sync_{field}": agse_item.should_sync_field(field) for field in sync_fields}
        }
        for agse_item in agse
        ]
        expected_return_value = {"agse":agse_data, "syncs":syncs}
        test_task_force = self.bottom_unit.uic

        response = self.client.post(
            reverse(
                "shiny_get_agse",
                kwargs={"uic": test_task_force},
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            generate_ordered(json.loads(response.content)),
            generate_ordered(expected_return_value),
        )


def generate_ordered(object):
    object_type = type(object)
    if object_type == dict:
        return sorted((key, generate_ordered(value)) for key, value in object.items())
    elif object_type == list:
        return sorted(generate_ordered(item) for item in object)
    else:
        return object
