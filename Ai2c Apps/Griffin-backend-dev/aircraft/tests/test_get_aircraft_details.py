import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse
from ninja.testing import TestClient

from aircraft.api.aircraft.routes import aircraft_router
from aircraft.model_utils import ModificationTypes
from aircraft.models import Aircraft
from auto_dsr.models import Unit
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_aircraft_modification,
    create_single_test_applied_modification,
    create_single_test_modification,
    create_test_units,
    create_test_user,
)


@tag("aircraft", "get_aircraft_details")
class GetAircraftDetailsTest(TestCase):
    def setUp(self):
        self.units, _ = create_test_units()
        self.parent_unit = Unit.objects.get(uic="TSUNFF")
        self.child_unit = Unit.objects.get(uic="TEST000AA")

        self.aircraft_1 = create_single_test_aircraft(
            current_unit=self.parent_unit, serial="TESTAIRCRAFT1", model="UH-60M"
        )
        self.aircraft_2 = create_single_test_aircraft(
            current_unit=self.child_unit,
            serial="TESTAIRCRAFT2",
            model="CH-47F",
            mds="TH-10AT",
        )

        self.modification = create_single_test_modification(name="Test Mod", type=ModificationTypes.STATUS)
        self.applied_mod = create_single_test_applied_modification(
            modification=self.modification, aircraft=self.aircraft_1, mod_column="status", mod_value="FMC"
        )
        self.aircraft_mod = create_single_test_aircraft_modification(aircraft=self.aircraft_1)
        self.user = create_test_user(unit=self.parent_unit)
        self.client = TestClient(aircraft_router, headers={"Auth-User": self.user.user_id})

    def test_get_aircraft_details_basic(self):
        response = self.client.get(f"/details?uic={self.parent_unit.uic}")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)

        for unit_group in data:
            self.assertIn("unit_short_name", unit_group)
            self.assertIn("models", unit_group)
            self.assertIsInstance(unit_group["models"], list)

    def test_aircraft_details_grouping(self):
        response = self.client.get(f"/details?uic={self.parent_unit.uic}")
        data = response.json()

        self.assertEqual(len(data), 2)

        for unit_group in data:
            self.assertEqual(len(unit_group["models"]), 1)
            self.assertEqual(len(unit_group["models"][0]["aircraft"]), 1)

    def test_aircraft_details_content(self):
        response = self.client.get(f"/details?uic={self.parent_unit.uic}")
        data = response.json()

        aircraft_detail = None
        for unit_group in data:
            for model_group in unit_group["models"]:
                for aircraft in model_group["aircraft"]:
                    if aircraft["serial"] == "TESTAIRCRAFT1":
                        aircraft_detail = aircraft
                        break

        self.assertIsNotNone(aircraft_detail)
        self.assertEqual(aircraft_detail["serial"], "TESTAIRCRAFT1")

        required_fields = [
            "status",
            "total_airframe_hours",
            "flight_hours",
            "hours_to_phase",
            "in_phase",
            "modifications",
        ]
        for field in required_fields:
            self.assertIn(field, aircraft_detail)

    def test_aircraft_modifications_included(self):
        response = self.client.get(f"/details?uic={self.parent_unit.uic}")
        data = response.json()

        aircraft_detail = None
        for unit_group in data:
            for model_group in unit_group["models"]:
                for aircraft in model_group["aircraft"]:
                    if aircraft["serial"] == "TESTAIRCRAFT1":
                        aircraft_detail = aircraft
                        break

        self.assertEqual(len(aircraft_detail["modifications"]), 1)

        modification = aircraft_detail["modifications"][0]
        self.assertEqual(modification["value"], "test 1")
        self.assertEqual(modification["mod_type"], "TEST1")

    def test_invalid_unit(self):
        response = self.client.get("/details?uic=NOTAUNIT")
        self.assertEqual(response.status_code, 404)

    def test_no_aircraft_for_unit(self):
        empty_unit = Unit.objects.create(
            uic="EMPTY001", short_name="Empty Unit", display_name="Empty Test Unit", echelon="CO"
        )

        response = self.client.get(f"/details?uic={empty_unit.uic}")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 0)

    def test_aircraft_without_airframe(self):
        aircraft_no_airframe = create_single_test_aircraft(
            current_unit=self.parent_unit, serial="NOAIRFRAME", model="TEST-MODEL", mds="XXX"
        )
        aircraft_no_airframe.airframe = None
        aircraft_no_airframe.save()

        response = self.client.get(f"/details?uic={self.parent_unit.uic}")
        data = response.json()

        found_aircraft = False
        for unit_group in data:
            for model_group in unit_group["models"]:
                if model_group["model"] == "TEST-MODEL":
                    for aircraft in model_group["aircraft"]:
                        if aircraft["serial"] == "NOAIRFRAME":
                            found_aircraft = True
                            break

        self.assertTrue(found_aircraft)

    def test_aircraft_mods_kits(self):
        """
        Testing the mods and kits data is being pulled correctly
        """
        response = self.client.get(f"/mods_kits?serial=TESTAIRCRAFT1")
        self.assertEqual(response.status_code, 200)
        expected = {"items": [{"id": 1, "mod_type": "TEST1", "value": "test 1"}], "count": 1}
        self.assertEqual(response.data, expected)
