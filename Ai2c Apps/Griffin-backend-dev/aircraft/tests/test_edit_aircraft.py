import json
from datetime import date, timedelta
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone
from ninja.testing import TestClient

from aircraft.api.aircraft.edit.routes import aircraft_edit_router
from aircraft.model_utils import AircraftStatuses
from aircraft.models import Aircraft, AircraftMod
from auto_dsr.model_utils import UserRoleAccessLevel
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_aircraft_modification,
    create_single_test_applied_modification,
    create_single_test_modification,
    create_single_test_modification_category,
    create_single_test_unit,
    create_test_aircraft_in_all,
    create_test_location,
    create_test_units,
    create_test_user,
    create_user_role_in_all,
    get_default_middle_unit,
    get_default_top_unit,
)


class AircraftEditEndpointTests(TestCase):
    """Test single and multiple aircraft edit endpoint"""

    def setUp(self):

        create_test_units()
        self.top_unit = get_default_top_unit()
        self.middle_unit = get_default_middle_unit()
        self.other_unit = create_single_test_unit()

        self.location = create_test_location()

        # user_w_access will have WRITE permissions for both units, partial will have WRITE to one, no access no WRITE
        self.user_w_access = create_test_user(self.top_unit)
        self.user_no_access = create_test_user(
            self.other_unit, user_id="0000000001", first_name="Simon", last_name="Cowell"
        )
        self.user_partial_access = create_test_user(
            self.middle_unit, user_id="000000002", first_name="Regina", last_name="George"
        )

        create_user_role_in_all(user=self.user_w_access, units=[self.top_unit, self.other_unit])
        create_user_role_in_all(user=self.user_partial_access, units=[self.middle_unit])
        create_user_role_in_all(
            user=self.user_no_access, units=[self.other_unit], user_access_level=UserRoleAccessLevel.READ
        )

        self.aircraft_top = create_test_aircraft_in_all(units=[self.top_unit])[0]
        self.aircraft_middle = create_test_aircraft_in_all(units=[self.middle_unit])[0]
        self.aircraft_other = create_test_aircraft_in_all(units=[self.other_unit])[0]

        self.modification = create_single_test_modification("Wings")
        self.applied_modification = create_single_test_applied_modification(self.modification, self.aircraft_top)
        self.aircraft_mod = create_single_test_aircraft_modification(aircraft=self.aircraft_top)

        self.client = TestClient(aircraft_edit_router, headers={"Auth-User": self.user_w_access.user_id})
        self.client_partial = TestClient(aircraft_edit_router, headers={"Auth-User": self.user_partial_access.user_id})
        self.client_no_access = TestClient(aircraft_edit_router, headers={"Auth-User": self.user_no_access.user_id})

    def test_successful_edit_all_aircraft(self):
        """Test successful edit when user has access to all aircraft"""
        payload = [
            {
                "serial": self.aircraft_top.serial,
                "status": AircraftStatuses.NMC,
                "rtl": "NRTL",
                "total_airframe_hours": 300.0,
                "flight_hours": 10.0,
                "location_id": self.location.id,
                "remarks": "testing editing remarks",
                "field_sync_status": {
                    "rtl": True,
                    "status": True,
                    "location_id": True,
                    "total_airframe_hours": False,
                    "flight_hours": False,
                    "remarks": True,
                },
                "mods": [
                    {
                        "id": self.aircraft_mod.id,
                        "mod_type": self.aircraft_mod.mod_type.name,
                        "value": self.aircraft_mod.value,
                    }
                ],
            },
            {"serial": self.aircraft_other.serial, "rtl": "NRTL", "total_airframe_hours": 150.0},
        ]

        response = self.client.patch("", json=payload, user=self.user_w_access)

        data = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data["edited_aircraft"]), 2)
        self.assertEqual(len(data["not_edited_aircraft"]), 0)
        self.assertIn(self.aircraft_top.serial, data["edited_aircraft"])
        self.assertIn(self.aircraft_other.serial, data["edited_aircraft"])

        self.aircraft_top.refresh_from_db()
        self.aircraft_other.refresh_from_db()
        self.assertEqual(self.aircraft_top.status, AircraftStatuses.NMC)
        self.assertEqual(self.aircraft_top.rtl, "NRTL")
        self.assertEqual(self.aircraft_top.total_airframe_hours, 300.0)
        self.assertEqual(self.aircraft_top.flight_hours, 10.0)
        self.assertEqual(self.aircraft_top.location_id, self.location.id)
        self.assertEqual(self.aircraft_top.remarks, "testing editing remarks")
        self.assertEqual(
            self.aircraft_top.field_sync_status,
            {
                "rtl": True,
                "status": True,
                "location_id": True,
                "total_airframe_hours": False,
                "flight_hours": False,
                "remarks": True,
            },
        )
        self.assertTrue(AircraftMod.objects.filter(id=self.aircraft_mod.id).exists())
        self.assertEqual(self.aircraft_other.rtl, "NRTL")
        self.assertEqual(self.aircraft_other.total_airframe_hours, 150.0)

    def test_no_access_returns_403(self):
        """Test 403 when user has no access to any aircraft"""
        payload = [{"serial": self.aircraft_other.serial, "status": AircraftStatuses.NMC}]

        response = self.client_no_access.patch("", json=payload, user=self.user_no_access)
        data = response.json()

        self.assertEqual(response.status_code, 403)
        self.assertEqual(data["edited_aircraft"], [])
        self.assertEqual(data["not_edited_aircraft"], [self.aircraft_other.serial])
        self.assertIn("do not have write access", data["detail"])

    def test_edit_partial_access(self):
        """Test when a user has partial access to the aircraft being editd"""
        payload = [
            {"serial": self.aircraft_top.serial, "status": AircraftStatuses.NMC, "remarks": "test"},
            {"serial": self.aircraft_middle.serial, "rtl": "NRTL", "total_airframe_hours": 150.00},
        ]

        response = self.client_partial.patch("", json=payload, user=self.user_partial_access)
        data = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["edited_aircraft"], [self.aircraft_middle.serial])
        self.assertEqual(data["not_edited_aircraft"], [self.aircraft_top.serial])

        self.aircraft_middle.refresh_from_db()
        self.assertEqual(self.aircraft_middle.rtl, "NRTL")
        self.assertEqual(self.aircraft_middle.total_airframe_hours, 150.0)

    def test_edit_invalid_field(self):
        """Test that 422 is returned when trying to edit an invalid field"""

        payload = [
            {"serial": self.aircraft_middle.serial, "model": "Test", "remarks": "test"},
        ]
        response = self.client.patch("", json=payload, user=self.user_w_access)
        data = response.json()
        self.assertEqual(response.status_code, 422)

    def test_edit_invalid_aircraft(self):
        """Test that invalid aircraft are returned as not edited aircraft"""

        payload = [
            {"serial": self.aircraft_middle.serial, "status": AircraftStatuses.NMC, "remarks": "test"},
            {"serial": "FAKEAIRCRAFT", "rtl": "NRTL", "total_airframe_hours": 150.00},
            {"serial": "FAKEAIRCRAFT2", "rtl": "RTL", "flight_hours": 15.00},
        ]

        response = self.client.patch("", json=payload, user=self.user_w_access)
        data = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["edited_aircraft"], [self.aircraft_middle.serial])
        self.assertEqual(len(data["not_edited_aircraft"]), 2)

        self.aircraft_middle.refresh_from_db()
        self.assertEqual(self.aircraft_middle.status, AircraftStatuses.NMC)
        self.assertEqual(self.aircraft_middle.remarks, "test")

    def test_edit_empty_payload(self):
        """Test handling of empty payload"""
        payload = []
        response = self.client.patch("", json=payload, user=self.user_w_access)
        data = response.json()

        self.assertEqual(response.status_code, 200)

    def test_mixed_valid_invalid_and_no_access(self):
        """Test a scanario with a mix of valid, invalid, and no access"""
        payload = [
            {"serial": self.aircraft_middle.serial, "total_airframe_hours": 300.0},  # valid + access
            {"serial": self.aircraft_top.serial, "remarks": "Test remarks"},  # valid + no access
            {"serial": "FAKEAIRCRAFT", "total_airframe_hours": 300.0},  # invalid serial
        ]

        response = self.client_partial.patch("", json=payload, user=self.user_partial_access)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["edited_aircraft"]), 1)
        self.assertIn(self.aircraft_middle.serial, data["edited_aircraft"])

        self.aircraft_middle.refresh_from_db()
        self.assertEqual(self.aircraft_middle.total_airframe_hours, 300.0)

        self.assertEqual(len(data["not_edited_aircraft"]), 2)
        self.assertIn(self.aircraft_top.serial, data["not_edited_aircraft"])
        self.assertIn("FAKEAIRCRAFT", data["not_edited_aircraft"])

        self.aircraft_top.refresh_from_db()
        self.assertEqual(self.aircraft_top.remarks, None)

    def test_delete_modifcations_not_in_list(self):
        """Test that modifications not in the list are deleted"""
        mod2 = create_single_test_modification("Tanks")
        mod3 = create_single_test_modification("FRIES")
        applied_mod2 = create_single_test_applied_modification(mod2, self.aircraft_top)
        applied_mod3 = create_single_test_applied_modification(mod3, self.aircraft_top)
        aircraft_mod2 = create_single_test_aircraft_modification(aircraft=self.aircraft_top, name="TEST2")
        aircraft_mod3 = create_single_test_aircraft_modification(aircraft=self.aircraft_top, name="TEST3")

        payload = [
            {
                "serial": self.aircraft_top.serial,
                "mods": [
                    {"id": self.aircraft_mod.id, "mod_type": self.aircraft_mod.mod_type.name},
                    {"id": aircraft_mod3.id, "mod_type": aircraft_mod3.mod_type.name},
                ],
            }
        ]

        response = self.client.patch("", json=payload, user=self.user_w_access)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(AircraftMod.objects.filter(id=self.aircraft_mod.id).exists())
        self.assertFalse(AircraftMod.objects.filter(id=aircraft_mod2.id).exists())
        self.assertTrue(AircraftMod.objects.filter(id=aircraft_mod3.id).exists())

    def test_edit_aircraft_with_access_to_any_uic(self):
        """Test that a user can edit aircraft if they have access to ANY of its UICs"""
        uic_taskforce = create_single_test_unit(uic="TF-123456")
        uic_organic = create_single_test_unit(uic="OG-987654")

        aircraft_multi_uic = create_single_test_aircraft(current_unit=uic_taskforce)
        aircraft_multi_uic.uic.add(uic_organic)

        user_organic_only = create_test_user(unit=uic_organic, user_id="000000003")
        create_user_role_in_all(user=user_organic_only, units=[uic_organic])
        client = TestClient(aircraft_edit_router, headers={"Auth-User": user_organic_only.user_id})

        payload = [{"serial": aircraft_multi_uic.serial, "status": AircraftStatuses.NMC, "remarks": "test"}]

        response = client.patch("", json=payload, user=user_organic_only)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["edited_aircraft"]), 1)
        self.assertIn(aircraft_multi_uic.serial, data["edited_aircraft"])
        self.assertEqual(len(data["not_edited_aircraft"]), 0)

        aircraft_multi_uic.refresh_from_db()
        self.assertEqual(aircraft_multi_uic.status, AircraftStatuses.NMC)
        self.assertEqual(aircraft_multi_uic.remarks, "test")
