from datetime import date

from django.db import transaction
from django.test import TestCase, tag
from django.utils import timezone
from ninja.testing import TestClient

from aircraft.api.aircraft.routes import aircraft_router
from aircraft.model_utils.phase_types import PhaseTypes
from aircraft.models import DA_1352, Aircraft, Airframe, Inspection
from utils.tests import (
    create_single_test_short_life,
    create_test_aircraft_in_all,
    create_test_inspection_from_aircraft,
    create_test_units,
    create_test_user,
)


@tag("aircraft")
class AircraftTest(TestCase):
    def setUp(self):
        # Create unit to house test aircraft
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])

        # Create Aircraft in Unit
        self.unit_aircraft = create_test_aircraft_in_all(self.units_created)
        tmp_air = self.unit_aircraft[len(self.unit_aircraft) - 1]
        temp_af = Airframe.objects.create(mds="CH-47A", model="CH-47A", family="CHINOOK")
        tmp_air.airframe = temp_af
        tmp_air.model = "CH-47A"
        tmp_air.next_phase_type = PhaseTypes.C2
        tmp_air.save()
        Inspection.objects.create(
            serial=tmp_air,
            inspection_name="320 Hour",
            last_conducted_hours=100.0,
            hours_interval=320,
            next_due_hours=220.0,
        )
        self.client = TestClient(aircraft_router, headers={"Auth-User": self.user.user_id})
        self.unauthorized_client = TestClient(aircraft_router, headers={"Auth-User": "FAKE_USER"})

        # create inspection for aircraft
        self.unit_inspection = create_test_inspection_from_aircraft(self.unit_aircraft)

        # Create test DA_1352 records
        self.base_date = date(2023, 1, 15)
        self.test_1352s = []
        self.part_number = "1-222-333-4"

        # Create records for each aircraft
        for aircraft in self.unit_aircraft:
            for month_offset in range(3):  # Create 3 months of data
                report_date = date(2023, 1 + month_offset, 15)
                da_1352 = DA_1352.objects.create(
                    serial_number=aircraft,
                    reporting_uic=aircraft.current_unit,
                    reporting_month=report_date,
                    model_name=aircraft.model,
                    flying_hours=10.0,
                    fmc_hours=150.0,
                    field_hours=20.0,
                    pmcm_hours=30.0,
                    pmcs_hours=40.0,
                    dade_hours=50.0,
                    sust_hours=60.0,
                    nmcs_hours=70.0,
                    nmcm_hours=80.0,
                    total_hours_in_status_per_month=744.0,
                    total_reportable_hours_in_month=694.0,
                    source="TEST",
                )
                self.test_1352s.append(da_1352)

            create_single_test_short_life(aircraft)
            if aircraft.serial[-1] in ["0", "2"]:
                create_single_test_short_life(aircraft, part_number=self.part_number)

    # /aircraft tests
    def test_list_aircraft_valid_unit(self):
        response = self.client.get(f"/?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        # Should return 4 aircraft, one from each company & one at bn level
        self.assertEqual(response.data["count"], 4)
        self.assertEqual(response.data["items"][0]["serial"], "TEST000AAAIRCRAFT0")

    def test_list_aircraft_invalid_unit(self):
        response = self.client.get("/?uic=FAKEUNIT")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)  # No aircraft for Fake unit

    def test_list_aircraft_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 401)

    def test_list_aircraft_dsr_valid_unit(self):
        response = self.client.get(f"/dsr?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        # Should return 4 aircraft, one from each company & one at bn level
        self.assertEqual(len(response.data["aircraft"]), 4)
        self.assertEqual(response.data["aircraft"][0]["serial"], "TEST000AAAIRCRAFT0")

        # assert Inspections should have 12 inspection
        self.assertEqual(len(response.data["inspection"]), 13)
        self.assertIn("inspection__id", response.data["inspection"][0])
        self.assertIn("inspection__inspection_name", response.data["inspection"][0])
        self.assertIn("inspection__last_conducted_hours", response.data["inspection"][0])
        self.assertIn("inspection__next_due_hours", response.data["inspection"][0])
        self.assertIn("till_due", response.data["inspection"][0])
        self.assertIn("serial", response.data["inspection"][0])

    def test_list_aircraft_dsr_valid_serial(self):
        response = self.client.get(f"/dsr?serials=TEST000AAAIRCRAFT0")
        self.assertEqual(response.status_code, 200)
        # Should return 1 aircraft information
        self.assertEqual(len(response.data["aircraft"]), 1)
        self.assertEqual(response.data["aircraft"][0]["serial"], "TEST000AAAIRCRAFT0")

        # assert Inspections should have 3 inspection
        self.assertEqual(len(response.data["inspection"]), 3)
        self.assertIn("inspection__id", response.data["inspection"][0])
        self.assertIn("inspection__inspection_name", response.data["inspection"][0])
        self.assertIn("inspection__last_conducted_hours", response.data["inspection"][0])
        self.assertIn("inspection__next_due_hours", response.data["inspection"][0])
        self.assertIn("till_due", response.data["inspection"][0])
        self.assertIn("serial", response.data["inspection"][0])

    def test_list_aircraft_dsr_valid_serial_list(self):
        """
        Test for a list of serials
        """
        response = self.client.get(f"/dsr?serials=TEST000AAAIRCRAFT0&serials=TEST000C0AIRCRAFT3")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["aircraft"]), 2)

    def test_list_aircraft_dsr_invalid(self):
        """
        Test for the invalid case in serial and unit
        """
        # invalid unit
        response = self.client.get(f"/dsr?uic=INVALID")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["aircraft"]), 0)
        self.assertEqual(len(response.data["inspection"]), 0)

        # invalid serial
        response = self.client.get(f"/dsr?serials=INVALID")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["aircraft"]), 0)
        self.assertEqual(len(response.data["inspection"]), 0)

    def test_list_aircraft_dsr_missing_params(self):
        """
        Test for missing parameters
        """
        response = self.client.get(f"/dsr")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["detail"], "At least one of 'uic' or 'serials' list must be provided")

    def test_list_aircraft_valid_part(self):
        response = self.client.get(f"/?uic={self.units_created[0].uic}&part_number={self.part_number}")
        self.assertEqual(response.status_code, 200)
        # Should return 4 aircraft, one from each company & one at bn level
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["items"][0]["serial"], "TEST000AAAIRCRAFT0")
        self.assertEqual(response.data["items"][1]["serial"], "TEST000B0AIRCRAFT2")

    def test_list_aircraft_invalid_part(self):
        response = self.client.get(f"/?uic={self.units_created[0].uic}&part_number=XYZ")
        self.assertEqual(response.status_code, 200)
        # Should return 4 aircraft, one from each company & one at bn level
        self.assertEqual(response.data["count"], 0)

    def test_phase_flow_unit(self):
        response = self.client.get(f"/phase-flow?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        expected = [
            {
                "model": "TH-10A",
                "hours_to_320": None,
                "serial": "TEST000A0AIRCRAFT1",
                "total_airframe_hours": 100.0,
                "flight_hours": 0.0,
                "next_phase_type": "GEN",
                "hours_to_phase": 50.0,
                "current_unit": "TEST000A0",
                "owning_unit": "TEST000A0",
            },
            {
                "model": "TH-10A",
                "hours_to_320": None,
                "serial": "TEST000AAAIRCRAFT0",
                "total_airframe_hours": 100.0,
                "flight_hours": 0.0,
                "next_phase_type": "GEN",
                "hours_to_phase": 50.0,
                "current_unit": "TEST000AA",
                "owning_unit": "TEST000AA",
            },
            {
                "model": "TH-10A",
                "hours_to_320": None,
                "serial": "TEST000B0AIRCRAFT2",
                "total_airframe_hours": 100.0,
                "flight_hours": 0.0,
                "next_phase_type": "GEN",
                "hours_to_phase": 50.0,
                "current_unit": "TEST000B0",
                "owning_unit": "TEST000B0",
            },
            {
                "model": "CH-47A",
                "hours_to_320": 120.0,
                "serial": "TEST000C0AIRCRAFT3",
                "total_airframe_hours": 100.0,
                "flight_hours": 0.0,
                "next_phase_type": "C2",
                "hours_to_phase": 50.0,
                "current_unit": "TEST000C0",
                "owning_unit": "TEST000C0",
            },
        ]
        self.assertEqual(response.data, expected)

    def test_phase_flow_unit_models(self):
        response = self.client.get(f"/phase-flow?uic={self.units_created[0].uic}&models=TH-10A")
        self.assertEqual(response.status_code, 200)
        expected = [
            {
                "model": "TH-10A",
                "hours_to_320": None,
                "serial": "TEST000A0AIRCRAFT1",
                "total_airframe_hours": 100.0,
                "flight_hours": 0.0,
                "next_phase_type": "GEN",
                "hours_to_phase": 50.0,
                "current_unit": "TEST000A0",
                "owning_unit": "TEST000A0",
            },
            {
                "model": "TH-10A",
                "hours_to_320": None,
                "serial": "TEST000AAAIRCRAFT0",
                "total_airframe_hours": 100.0,
                "flight_hours": 0.0,
                "next_phase_type": "GEN",
                "hours_to_phase": 50.0,
                "current_unit": "TEST000AA",
                "owning_unit": "TEST000AA",
            },
            {
                "model": "TH-10A",
                "hours_to_320": None,
                "serial": "TEST000B0AIRCRAFT2",
                "total_airframe_hours": 100.0,
                "flight_hours": 0.0,
                "next_phase_type": "GEN",
                "hours_to_phase": 50.0,
                "current_unit": "TEST000B0",
                "owning_unit": "TEST000B0",
            },
        ]

        self.assertEqual(response.data, expected)

    def test_phase_flow_unit_models_empty(self):
        response = self.client.get(f"/phase-flow?uic={self.units_created[0].uic}&models=TH-20A")
        self.assertEqual(response.status_code, 200)
        expected = []
        self.assertEqual(response.data, expected)

    def test_phase_flow_subunit(self):
        response = self.client.get(f"/phase-flow-subordinates?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        expected = [
            {
                "uic": "TEST000A0",
                "aircraft": [
                    {
                        "model": "TH-10A",
                        "hours_to_320": None,
                        "serial": "TEST000A0AIRCRAFT1",
                        "total_airframe_hours": 100.0,
                        "flight_hours": 0.0,
                        "next_phase_type": "GEN",
                        "hours_to_phase": 50.0,
                        "current_unit": "TEST000A0",
                        "owning_unit": "TEST000A0",
                    }
                ],
            },
            {
                "uic": "TEST000B0",
                "aircraft": [
                    {
                        "model": "TH-10A",
                        "hours_to_320": None,
                        "serial": "TEST000B0AIRCRAFT2",
                        "total_airframe_hours": 100.0,
                        "flight_hours": 0.0,
                        "next_phase_type": "GEN",
                        "hours_to_phase": 50.0,
                        "current_unit": "TEST000B0",
                        "owning_unit": "TEST000B0",
                    }
                ],
            },
            {
                "uic": "TEST000C0",
                "aircraft": [
                    {
                        "model": "CH-47A",
                        "hours_to_320": 120.0,
                        "serial": "TEST000C0AIRCRAFT3",
                        "total_airframe_hours": 100.0,
                        "flight_hours": 0.0,
                        "next_phase_type": "C2",
                        "hours_to_phase": 50.0,
                        "current_unit": "TEST000C0",
                        "owning_unit": "TEST000C0",
                    }
                ],
            },
        ]
        self.assertEqual(response.data, expected)

    def test_phase_flow_subunit_models(self):
        response = self.client.get(f"/phase-flow-subordinates?uic={self.units_created[0].uic}&models=TH-10A")
        self.assertEqual(response.status_code, 200)
        # Should return 4 aircraft, one from each company & one at bn level
        expected = [
            {
                "uic": "TEST000A0",
                "aircraft": [
                    {
                        "model": "TH-10A",
                        "hours_to_320": None,
                        "serial": "TEST000A0AIRCRAFT1",
                        "total_airframe_hours": 100.0,
                        "flight_hours": 0.0,
                        "next_phase_type": "GEN",
                        "hours_to_phase": 50.0,
                        "current_unit": "TEST000A0",
                        "owning_unit": "TEST000A0",
                    }
                ],
            },
            {
                "uic": "TEST000B0",
                "aircraft": [
                    {
                        "model": "TH-10A",
                        "hours_to_320": None,
                        "serial": "TEST000B0AIRCRAFT2",
                        "total_airframe_hours": 100.0,
                        "flight_hours": 0.0,
                        "next_phase_type": "GEN",
                        "hours_to_phase": 50.0,
                        "current_unit": "TEST000B0",
                        "owning_unit": "TEST000B0",
                    }
                ],
            },
            {
                "uic": "TEST000C0",
                "aircraft": [],
            },
        ]
        self.assertEqual(response.data, expected)

    def test_phase_flow_subunit_models_empty(self):
        response = self.client.get(f"/phase-flow-subordinates?uic={self.units_created[0].uic}&models=TH-20A")
        self.assertEqual(response.status_code, 200)
        # Should return 4 aircraft, one from each company & one at bn level
        expected = [
            {"aircraft": [], "uic": "TEST000A0"},
            {"aircraft": [], "uic": "TEST000B0"},
            {"aircraft": [], "uic": "TEST000C0"},
        ]
        self.assertEqual(response.data, expected)

    def test_bank_hours_unit(self):
        response = self.client.get(f"/bank-hour-percentage?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        expected = [{"bank_percentage": 0.09765625, "key": "TEST000AA"}]
        self.assertEqual(response.data, expected)

    def test_bank_hours_sub(self):
        response = self.client.get(f"/bank-hour-percentage?uic={self.units_created[0].uic}&return_by=subordinates")
        self.assertEqual(response.status_code, 200)
        expected = [
            {"key": "TEST000A0", "bank_percentage": 0.10416666666666667},
            {"key": "TEST000B0", "bank_percentage": 0.10416666666666667},
            {"key": "TEST000C0", "bank_percentage": 0.078125},
        ]
        self.assertEqual(response.data, expected)

    def test_bank_hours_model(self):
        response = self.client.get(f"/bank-hour-percentage?uic={self.units_created[0].uic}&return_by=model")
        self.assertEqual(response.status_code, 200)
        expected = [
            {"key": "CH-47A", "bank_percentage": 0.078125},
            {"key": "TH-10A", "bank_percentage": 0.10416666666666667},
        ]
        self.assertEqual(response.data, expected)

    def test_bank_hours_model_filter(self):
        response = self.client.get(f"/bank-hour-percentage?uic={self.units_created[0].uic}&model=TH-10A")
        self.assertEqual(response.status_code, 200)
        expected = [{"bank_percentage": 0.10416666666666667, "key": "TEST000AA"}]
        self.assertEqual(response.data, expected)

        response = self.client.get(f"/bank-hour-percentage?uic={self.units_created[0].uic}&model=CH-10A")
        self.assertEqual(response.status_code, 200)
        expected = []
        self.assertEqual(response.data, expected)

    def test_company_aircraft(self):
        response = self.client.get(f"/companies?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        expected = [
            {
                "uic": "TEST000A0",
                "short_name": "A CO, 100th TEST",
                "display_name": "Alpha Company, 100th Test Aviation Regiment",
            },
            {
                "uic": "TEST000B0",
                "short_name": "B CO, 100th TEST",
                "display_name": "Bravo Company, 100th Test Aviation Regiment",
            },
            {
                "uic": "TEST000C0",
                "short_name": "C CO, 100th TEST",
                "display_name": "Charlie Company, 100th Test Aviation Regiment",
            },
        ]

        self.assertEqual(response.data, expected)

    def test_company_aircraft_serial(self):
        response = self.client.get(
            f"/companies?uic={self.units_created[0].uic}&aircraft=TEST000A0AIRCRAFT1&aircraft=TEST000B0AIRCRAFT2"
        )
        self.assertEqual(response.status_code, 200)
        expected = [
            {
                "uic": "TEST000A0",
                "display_name": "Alpha Company, 100th Test Aviation Regiment",
                "short_name": "A CO, 100th TEST",
            },
            {
                "uic": "TEST000B0",
                "display_name": "Bravo Company, 100th Test Aviation Regiment",
                "short_name": "B CO, 100th TEST",
            },
        ]
        self.assertEqual(response.data, expected)

    def test_company_aircraft_model(self):
        response = self.client.get(f"/companies?uic={self.units_created[0].uic}&models=TH-10A&models=CH-47A")
        self.assertEqual(response.status_code, 200)
        expected = [
            {
                "uic": "TEST000A0",
                "short_name": "A CO, 100th TEST",
                "display_name": "Alpha Company, 100th Test Aviation Regiment",
            },
            {
                "uic": "TEST000B0",
                "short_name": "B CO, 100th TEST",
                "display_name": "Bravo Company, 100th Test Aviation Regiment",
            },
            {
                "uic": "TEST000C0",
                "short_name": "C CO, 100th TEST",
                "display_name": "Charlie Company, 100th Test Aviation Regiment",
            },
        ]
        self.assertEqual(response.data, expected)

    def test_company_aircraft_model_serial(self):
        response = self.client.get(
            f"/companies?uic={self.units_created[0].uic}&models=TH-10A&aircraft=TEST000A0AIRCRAFT1&aircraft=TEST000B0AIRCRAFT2"
        )
        self.assertEqual(response.status_code, 200)
        expected = [
            {
                "display_name": "Alpha Company, 100th Test Aviation Regiment",
                "uic": "TEST000A0",
                "short_name": "A CO, 100th TEST",
            },
            {
                "display_name": "Bravo Company, 100th Test Aviation Regiment",
                "uic": "TEST000B0",
                "short_name": "B CO, 100th TEST",
            },
        ]
        self.assertEqual(response.data, expected)

    def test_company_aircraft_empty(self):
        response = self.client.get(
            f"/companies?uic={self.units_created[0].uic}&models=TH-10A&aircraft=TEST000A0AIRCRAFTX"
        )
        self.assertEqual(response.status_code, 200)
        expected = []
        self.assertEqual(response.data, expected)

    def test_company_aircraft_invalid_unit(self):
        response = self.client.get(f"/companies?uic=XYZABC")
        self.assertEqual(response.status_code, 404)

    def test_phase_flow_model(self):
        response = self.client.get(f"/phase-flow-models?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        expected = [
            {
                "model": "TH-10A",
                "aircraft": [
                    {
                        "model": "TH-10A",
                        "hours_to_320": None,
                        "current_unit": "TEST000A0",
                        "flight_hours": 0.0,
                        "hours_to_phase": 50.0,
                        "next_phase_type": "GEN",
                        "owning_unit": "TEST000A0",
                        "serial": "TEST000A0AIRCRAFT1",
                        "total_airframe_hours": 100.0,
                    },
                    {
                        "hours_to_320": None,
                        "current_unit": "TEST000B0",
                        "flight_hours": 0.0,
                        "next_phase_type": "GEN",
                        "hours_to_phase": 50.0,
                        "model": "TH-10A",
                        "owning_unit": "TEST000B0",
                        "serial": "TEST000B0AIRCRAFT2",
                        "total_airframe_hours": 100.0,
                    },
                ],
            },
            {
                "model": "CH-47A",
                "aircraft": [
                    {
                        "hours_to_320": 120.0,
                        "current_unit": "TEST000C0",
                        "flight_hours": 0.0,
                        "next_phase_type": "C2",
                        "hours_to_phase": 50.0,
                        "model": "CH-47A",
                        "owning_unit": "TEST000C0",
                        "serial": "TEST000C0AIRCRAFT3",
                        "total_airframe_hours": 100.0,
                    },
                ],
            },
        ]
        self.assertEqual(response.data, expected)

    def test_phase_flow_models_with_filter(self):
        response = self.client.get(f"/phase-flow-models?uic={self.units_created[0].uic}&models=TH-10A&models=TestEmpty")
        self.assertEqual(response.status_code, 200)
        # Should return 4 aircraft, one from each company & one at bn level
        expected = [
            {
                "model": "TH-10A",
                "aircraft": [
                    {
                        "current_unit": "TEST000A0",
                        "hours_to_320": None,
                        "flight_hours": 0.0,
                        "next_phase_type": "GEN",
                        "hours_to_phase": 50.0,
                        "model": "TH-10A",
                        "owning_unit": "TEST000A0",
                        "serial": "TEST000A0AIRCRAFT1",
                        "total_airframe_hours": 100.0,
                    },
                    {
                        "current_unit": "TEST000B0",
                        "hours_to_320": None,
                        "flight_hours": 0.0,
                        "next_phase_type": "GEN",
                        "hours_to_phase": 50.0,
                        "model": "TH-10A",
                        "owning_unit": "TEST000B0",
                        "serial": "TEST000B0AIRCRAFT2",
                        "total_airframe_hours": 100.0,
                    },
                ],
            },
            {"model": "TestEmpty", "aircraft": []},
        ]

        self.assertEqual(response.data, expected)

    def test_next_phase_types(self):
        """
        Test the save override for next_phase_type
        """
        with transaction.atomic():
            test_air = self.unit_aircraft[0]
            prior_phase = test_air.next_phase_type
            test_air.model = "UH-60"
            test_air.save()
            self.assertEqual(prior_phase, test_air.next_phase_type)

            new_air = Aircraft.objects.create(
                serial="TESTINGPHASESAVE",
                model="UH-60",
                rtl="RTL",
                current_unit=self.units_created[0],
                total_airframe_hours=100.0,
                flight_hours=10.0,
                hours_to_phase=20.0,
                last_sync_time=timezone.now(),
                last_export_upload_time=timezone.now(),
                last_update_time=timezone.now(),
            )

            self.assertEqual(PhaseTypes.PMI1, new_air.next_phase_type)

            new_air2 = Aircraft.objects.create(
                serial="TESTINGPHASESAVE2",
                model="CH-47",
                rtl="RTL",
                current_unit=self.units_created[0],
                total_airframe_hours=100.0,
                flight_hours=10.0,
                hours_to_phase=20.0,
                last_sync_time=timezone.now(),
                last_export_upload_time=timezone.now(),
                last_update_time=timezone.now(),
            )

            self.assertEqual(PhaseTypes.C2, new_air2.next_phase_type)

            new_air3 = Aircraft.objects.create(
                serial="TESTINGPHASESAVE3",
                model="AH-64D",
                rtl="RTL",
                current_unit=self.units_created[0],
                total_airframe_hours=100.0,
                flight_hours=10.0,
                hours_to_phase=20.0,
                last_sync_time=timezone.now(),
                last_export_upload_time=timezone.now(),
                last_update_time=timezone.now(),
            )

            self.assertEqual(PhaseTypes.GENERIC, new_air3.next_phase_type)

            # Test phase does not change on update
            new_air.next_phase_type = PhaseTypes.GENERIC
            new_air.save()
            new_air.rtl = "NTRL"
            new_air.save()

            self.assertEqual(Aircraft.objects.get(serial=new_air.serial).next_phase_type, PhaseTypes.GENERIC)

    def test_aircraft_mods_kits(self):
        """
        Testing the mods and kits data is being pulled correctly
        """
        response = self.client.get(f"/mods_kits?serial=TESTAIRCRAFT2&models=TH-10A&models=TestEmpty")
        self.assertEqual(response.status_code, 200)
        print(response.data)
