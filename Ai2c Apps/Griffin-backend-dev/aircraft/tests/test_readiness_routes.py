import calendar
import random
import string
from datetime import date, datetime, time

from dateutil.relativedelta import relativedelta
from django.test import TestCase, tag
from django.utils.timezone import make_aware
from ninja.testing import TestClient

from aircraft.api.readiness.routes import readiness_router
from aircraft.model_utils import FlightMissionTypes
from aircraft.models import DA_1352
from utils.tests import (
    create_single_test_flight,
    create_test_aircraft_in_all,
    create_test_units,
    create_test_user,
    update_similar_units,
)
from utils.tests.test_maintenance_data_creation import create_test_maintenance_base
from utils.time.reporting_periods import get_reporting_period, two_years_prior


@tag("readiness")
class AircraftTest(TestCase):
    def setUp(self):
        # Create unit to house test aircraft
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.other_units_created, self.other_uic_hierarchy = create_test_units(
            uic_stub="TESTA00",
            echelon="BN",
            short_name="101st TEST",
            display_name="101st Test Aviation Regiment",
        )

        self.more_units_created, self.other_uic_hierarchy = create_test_units(
            uic_stub="TESTB00",
            echelon="BN",
            short_name="102nd TEST",
            display_name="102nd Test Aviation Regiment",
        )

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])

        # Created units returns all units, not just ones created
        # Since this test will have multiple units, filter out based on the units created above
        self.units_created = self.units_created.filter(uic__startswith="TEST000")
        self.other_units_created = self.other_units_created.filter(uic__startswith="TESTA00")
        self.more_units_created = self.more_units_created.filter(uic__startswith="TESTB00")

        # Create Aircraft in Unit
        self.unit_aircraft = create_test_aircraft_in_all(self.units_created)
        self.other_unit_aircraft = create_test_aircraft_in_all(self.other_units_created)
        self.more_unit_aircraft = create_test_aircraft_in_all(self.more_units_created)
        self.client = TestClient(readiness_router, headers={"Auth-User": self.user.user_id})
        self.unauthorized_client = TestClient(readiness_router, headers={"Auth-User": "FAKE_USER"})

        # Create test DA_1352 records
        self.base_date = date(2023, 1, 15)
        self.test_1352s = []
        self.test_flights = []
        self.other_test_1352s = []
        self.other_test_flights = []

        # Create dates for API calls
        _, self.reporting_end_date = get_reporting_period()
        self.reporting_start_date = two_years_prior(self.reporting_end_date)

        # Create records for each aircraft
        for aircraft in self.unit_aircraft:
            for month_offset in range(3):  # Create 3 months of data
                report_date = self.reporting_start_date + relativedelta(months=month_offset)
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
                self.test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.MAINTENANCE_TEST_FLIGHT,
                        flight_N_hours=0,
                        flight_NG_hours=0,
                        flight_NS_hours=0,
                        flight_W_hours=15.0,
                        start_datetime=make_aware(datetime.combine(report_date, time(14, 19, 0))),
                    )
                )
                self.test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.TRAINING,
                        flight_D_hours=0,
                        flight_DS_hours=0,
                        flight_W_hours=10.0,
                        start_datetime=make_aware(datetime.combine(report_date, time(00, 19, 0))),
                    )
                )
                self.test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.SERVICE,
                        flight_W_hours=25.0,
                        start_datetime=make_aware(datetime.combine(report_date, time(6, 19, 0))),
                    )
                )
                create_test_maintenance_base(serial_number=aircraft, uic=aircraft.current_unit, man_hours=40.0)

        # Create other records for each aircraft
        for aircraft in self.other_unit_aircraft:
            for month_offset in range(3):  # Create 3 months of data
                report_date = self.reporting_start_date + relativedelta(months=month_offset)
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
                self.other_test_1352s.append(da_1352)
                self.other_test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.MAINTENANCE_TEST_FLIGHT,
                        flight_N_hours=0,
                        flight_NG_hours=0,
                        flight_NS_hours=0,
                        total_hours=20,
                        start_datetime=make_aware(datetime.combine(report_date, time(14, 19, 0))),
                    )
                )
                self.other_test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.TRAINING,
                        flight_D_hours=0,
                        flight_DS_hours=0,
                        total_hours=30,
                        start_datetime=make_aware(datetime.combine(report_date, time(00, 19, 0))),
                    )
                )
                self.other_test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        total_hours=50,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.SERVICE,
                        start_datetime=make_aware(datetime.combine(report_date, time(6, 19, 0))),
                    )
                )
                create_test_maintenance_base(serial_number=aircraft, uic=aircraft.current_unit, man_hours=5.0)

        # Create other records for each aircraft
        for aircraft in self.more_unit_aircraft:
            for month_offset in range(3):  # Create 3 months of data
                report_date = self.reporting_start_date + relativedelta(months=month_offset)
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
                self.other_test_1352s.append(da_1352)
                self.other_test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.MAINTENANCE_TEST_FLIGHT,
                        flight_N_hours=0,
                        flight_NG_hours=0,
                        flight_NS_hours=0,
                        total_hours=20,
                        start_datetime=make_aware(datetime.combine(report_date, time(14, 19, 0))),
                    )
                )
                self.other_test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.TRAINING,
                        flight_D_hours=0,
                        flight_DS_hours=0,
                        total_hours=30,
                        start_datetime=make_aware(datetime.combine(report_date, time(00, 19, 0))),
                    )
                )
                self.other_test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        total_hours=50,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.SERVICE,
                        start_datetime=make_aware(datetime.combine(report_date, time(6, 19, 0))),
                    )
                )
                create_test_maintenance_base(serial_number=aircraft, uic=aircraft.current_unit, man_hours=1.0)

        # Update the similar units
        update_similar_units()

    # /1352 tests
    def test_list_aircraft_1352_default_dates(self):
        """Test fetching 1352s with default date range"""
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/1352?uic={parent_uic}")
        self.assertEqual(response.status_code, 200)
        self.assertIn("count", response.data)
        self.assertIn("items", response.data)
        # Each aircraft should have 3 months of data
        expected_count = len(self.unit_aircraft) * 3
        self.assertEqual(response.data["count"], expected_count)

    def test_list_aircraft_1352_date_range(self):
        """Test fetching 1352s with specific date range"""
        parent_uic = self.units_created[0].uic
        start_date = date(self.reporting_start_date.year, self.reporting_start_date.month, 1)  # Start of Month
        end_date = date(
            self.reporting_start_date.year,
            self.reporting_start_date.month,
            calendar.monthrange(self.reporting_start_date.year, self.reporting_start_date.month)[1],
        )  # End of Month
        response = self.client.get(
            f"/1352?uic={parent_uic}"
            f"&start_date={start_date.strftime('%Y-%m-%d')}"
            f"&end_date={end_date.strftime('%Y-%m-%d')}"
        )
        self.assertEqual(response.status_code, 200)
        # Should only get one record per aircraft (the Jan 15th record)
        self.assertEqual(response.data["count"], len(self.unit_aircraft))

    def test_list_aircraft_1352_includes_subordinates(self):
        """Test that response includes 1352s from subordinate units"""
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/1352?uic={parent_uic}")
        self.assertEqual(response.status_code, 200)
        # Get the UICs from the response items
        reporting_uics = {item["reporting_uic"] for item in response.data["items"]}
        # Check that we see records from each unit's UIC
        unit_uics = {unit.uic for unit in self.units_created}
        self.assertTrue(unit_uics.issubset(reporting_uics))

    def test_list_aircraft_1352_unauthorized(self):
        """Test unauthorized access is rejected"""
        parent_uic = self.units_created[0].uic
        response = self.unauthorized_client.get(f"/1352?uic={parent_uic}")
        self.assertEqual(response.status_code, 401)

    def test_status_over_time_default_dates(self):
        """Test Status Over Time api call"""
        expected = [
            {
                "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                "total_fmc_hours": 600.0,
                "total_field_hours": 80.0,
                "total_pmcm_hours": 120.0,
                "total_pmcs_hours": 160.0,
                "total_dade_hours": 200.0,
                "total_sust_hours": 240.0,
                "total_nmcs_hours": 280.0,
                "total_hours_in_status": 2976.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                ),
                "total_fmc_hours": 600.0,
                "total_field_hours": 80.0,
                "total_pmcm_hours": 120.0,
                "total_pmcs_hours": 160.0,
                "total_dade_hours": 200.0,
                "total_sust_hours": 240.0,
                "total_nmcs_hours": 280.0,
                "total_hours_in_status": 2976.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                ),
                "total_fmc_hours": 600.0,
                "total_field_hours": 80.0,
                "total_pmcm_hours": 120.0,
                "total_pmcs_hours": 160.0,
                "total_dade_hours": 200.0,
                "total_sust_hours": 240.0,
                "total_nmcs_hours": 280.0,
                "total_hours_in_status": 2976.0,
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/status-over-time?uic={parent_uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_status_over_time_specified_dates(self):
        """Test Status Over Time api call with specified dates"""
        start_date = date(self.reporting_start_date.year, self.reporting_start_date.month, 15)
        end_date = date(self.reporting_start_date.year, self.reporting_start_date.month + 1, 15)
        expected = [
            {
                "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                "total_fmc_hours": 600.0,
                "total_field_hours": 80.0,
                "total_pmcm_hours": 120.0,
                "total_pmcs_hours": 160.0,
                "total_dade_hours": 200.0,
                "total_sust_hours": 240.0,
                "total_nmcs_hours": 280.0,
                "total_hours_in_status": 2976.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                ),
                "total_fmc_hours": 600.0,
                "total_field_hours": 80.0,
                "total_pmcm_hours": 120.0,
                "total_pmcs_hours": 160.0,
                "total_dade_hours": 200.0,
                "total_sust_hours": 240.0,
                "total_nmcs_hours": 280.0,
                "total_hours_in_status": 2976.0,
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/status-over-time?uic={parent_uic}&start_date={start_date}&end_date={end_date}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_missions_flown(self):
        self.maxDiff = None
        """Test Missions Flow api call"""
        expected = [
            {
                "mission_type": "MAINTENANCE_TEST_FLIGHT",
                "day_mission_count": 12,
                "night_mission_count": 0,
                "day_mission_hours": 90.0,
                "night_mission_hours": 0.0,
                "weather_mission_count": 12,
                "weather_mission_hours": 180.0,
            },
            {
                "mission_type": "SERVICE",
                "day_mission_count": 12,
                "night_mission_count": 12,
                "day_mission_hours": 90.0,
                "night_mission_hours": 114.0,
                "weather_mission_count": 12,
                "weather_mission_hours": 300.0,
            },
            {
                "mission_type": "TRAINING",
                "day_mission_count": 0,
                "night_mission_count": 12,
                "day_mission_hours": 0.0,
                "night_mission_hours": 114.0,
                "weather_mission_count": 12,
                "weather_mission_hours": 120.0,
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/missions-flown?uic={parent_uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_missions_flown_specific_date(self):
        """Test Missions Flow api call for specific dates"""
        start_date = date(self.reporting_start_date.year, self.reporting_start_date.month, 15)
        end_date = date(self.reporting_start_date.year, self.reporting_start_date.month + 1, 15)
        expected = [
            {
                "mission_type": "MAINTENANCE_TEST_FLIGHT",
                "day_mission_count": 8,
                "night_mission_count": 0,
                "day_mission_hours": 60.0,
                "night_mission_hours": 0.0,
                "weather_mission_count": 8,
                "weather_mission_hours": 120.0,
            },
            {
                "mission_type": "SERVICE",
                "day_mission_count": 8,
                "night_mission_count": 8,
                "day_mission_hours": 60.0,
                "night_mission_hours": 76.0,
                "weather_mission_count": 8,
                "weather_mission_hours": 200.0,
            },
            {
                "mission_type": "TRAINING",
                "day_mission_count": 0,
                "night_mission_count": 8,
                "day_mission_hours": 0.0,
                "night_mission_hours": 76.0,
                "weather_mission_count": 8,
                "weather_mission_hours": 80.0,
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/missions-flown?uic={parent_uic}&start_date={start_date}&end_date={end_date}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_hours_flown_unit(self):
        """Test hours flown by unit api call"""
        expected = [
            {
                "uic": "TEST000AA",
                "hours_detail": [
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "uic": "TESTA00AA",
                "hours_detail": [
                    {
                        "hours_flown": 400.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 400.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 400.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/hours-flown-unit?uic={parent_uic}&similar_uics={self.other_units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_hours_flown_unit_specific_dates(self):
        """Test hours flown by unit for specific date api call"""
        start_date = date(self.reporting_start_date.year, self.reporting_start_date.month, 15)
        end_date = start_date + relativedelta(months=2)
        expected = [
            {
                "uic": "TEST000AA",
                "hours_detail": [
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "uic": "TESTA00AA",
                "hours_detail": [
                    {
                        "hours_flown": 400.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 400.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 400.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(
            f"/hours-flown-unit?uic={parent_uic}&similar_uics={self.other_units_created[0].uic}&start_date={start_date}&end_date={end_date}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_hours_flown_sub(self):
        """Test hours flown by subordinates api call"""
        expected = [
            {
                "parent_uic": "TEST000AA",
                "uic": "TEST000A0",
                "hours_detail": [
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TEST000AA",
                "uic": "TEST000B0",
                "hours_detail": [
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TEST000AA",
                "uic": "TEST000C0",
                "hours_detail": [
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TESTA00AA",
                "uic": "TESTA00A0",
                "hours_detail": [
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TESTA00AA",
                "uic": "TESTA00B0",
                "hours_detail": [
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TESTA00AA",
                "uic": "TESTA00C0",
                "hours_detail": [
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(
            f"/hours-flown-subordinate?uic={parent_uic}&similar_uics={self.other_units_created[0].uic}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_hours_flown_sub_specific_dates(self):
        """Test hours flown by subordinates for specific date api call"""
        start_date = date(self.reporting_start_date.year, self.reporting_start_date.month, 15)
        end_date = start_date + relativedelta(months=2)
        expected = [
            {
                "parent_uic": "TEST000AA",
                "uic": "TEST000A0",
                "hours_detail": [
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TEST000AA",
                "uic": "TEST000B0",
                "hours_detail": [
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TEST000AA",
                "uic": "TEST000C0",
                "hours_detail": [
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 30.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TESTA00AA",
                "uic": "TESTA00A0",
                "hours_detail": [
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TESTA00AA",
                "uic": "TESTA00B0",
                "hours_detail": [
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
            {
                "parent_uic": "TESTA00AA",
                "uic": "TESTA00C0",
                "hours_detail": [
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 100.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(
            f"/hours-flown-subordinate?uic={parent_uic}&similar_uics={self.other_units_created[0].uic}&start_date={start_date}&end_date={end_date}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_hours_flown_model(self):
        """Test hours flown by models api call"""
        expected = [
            {
                "model": "TH-10A",
                "hours_detail": [
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 0.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            }
        ]

        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/hours-flown-model?uic={parent_uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_hours_flown_model_specific_dates(self):
        """Test hours flown by model for specific date api call"""
        start_date = date(self.reporting_start_date.year, self.reporting_start_date.month, 15)
        end_date = start_date + relativedelta(months=2)
        expected = [
            {
                "model": "TH-10A",
                "hours_detail": [
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                    },
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                        ),
                    },
                    {
                        "hours_flown": 120.0,
                        "reporting_month": "{}".format(
                            (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                        ),
                    },
                ],
            }
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/hours-flown-model?uic={parent_uic}&start_date={start_date}&end_date={end_date}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_crew_operational_readiness_default_dates(self):
        """Test hours flown by model for specific date api call"""
        expected = [
            {
                "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                "or_rate": 0.20161290322580644,
                "tcrm": 0.2620967741935484,
                "intensity": 0.3225806451612903,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.20161290322580644,
                "tcrm": 0.2620967741935484,
                "intensity": 0.3225806451612903,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.20161290322580644,
                "tcrm": 0.2620967741935484,
                "intensity": 0.3225806451612903,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+3)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+4)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+5)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+6)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+7)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+8)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+9)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+10)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+11)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+12)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+13)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+14)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+15)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+16)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+17)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+18)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+19)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+20)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+21)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+22)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+23)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+24)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.0,
                "tcrm": 0.0,
                "intensity": 0.0,
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/crew-operational-readiness?uic={parent_uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_crew_operational_readiness_specific_dates(self):
        """Test hours flown by model for specific date api call"""
        start_date = date(self.reporting_start_date.year, self.reporting_start_date.month, 15)
        end_date = start_date + relativedelta(months=2)
        expected = [
            {
                "reporting_month": "{}".format(self.reporting_start_date.strftime("%Y-%m-%d")),
                "or_rate": 0.20161290322580644,
                "tcrm": 0.2620967741935484,
                "intensity": 0.3225806451612903,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+1)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.20161290322580644,
                "tcrm": 0.2620967741935484,
                "intensity": 0.3225806451612903,
            },
            {
                "reporting_month": "{}".format(
                    (self.reporting_start_date + relativedelta(months=+2)).strftime("%Y-%m-%d")
                ),
                "or_rate": 0.20161290322580644,
                "tcrm": 0.2620967741935484,
                "intensity": 0.3225806451612903,
            },
        ]
        parent_uic = self.units_created[0].uic
        response = self.client.get(
            f"/crew-operational-readiness?uic={parent_uic}&start_date={start_date}&end_date={end_date}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_missions_flown_detail_basic(self):
        """Test basic functionality of missions flown detail endpoint with default dates"""
        parent_uic = self.units_created[0].uic
        response = self.client.get(
            f"/missions-flown-detail?uic={parent_uic}&mission_type={FlightMissionTypes.TRAINING}"
        )
        self.assertEqual(response.status_code, 200)
        # Verify response structure and data
        for mission in response.data:
            self.assertIn("unit", mission)
            self.assertIn("mission_type", mission)
            self.assertIn("day_mission_hours", mission)
            self.assertIn("night_mission_hours", mission)
            self.assertIn("start_date", mission)
            self.assertIn("stop_date", mission)
            # Verify mission type matches request
            self.assertEqual(mission["mission_type"], FlightMissionTypes.TRAINING)
            # Verify unit is in hierarchy
            self.assertTrue(any(unit.uic == mission["unit"] for unit in self.units_created))

    def test_missions_flown_detail_specific_dates(self):
        """Test missions flown detail endpoint with specific date range"""
        parent_uic = self.units_created[0].uic
        start_date = date(self.reporting_start_date.year, self.reporting_start_date.month, 1)
        end_date = date(self.reporting_start_date.year, self.reporting_start_date.month + 1, 1)
        response = self.client.get(
            f"/missions-flown-detail?uic={parent_uic}"
            f"&mission_type={FlightMissionTypes.MAINTENANCE_TEST_FLIGHT}"
            f"&start_date={start_date.strftime('%Y-%m-%d')}"
            f"&end_date={end_date.strftime('%Y-%m-%d')}"
        )
        self.assertEqual(response.status_code, 200)
        # Verify all missions fall within date range
        for mission in response.data:
            mission_date = datetime.strptime(mission["start_date"], "%Y-%m-%d").date()
            self.assertTrue(start_date <= mission_date <= end_date)

    def test_missions_flown_detail_unauthorized(self):
        """Test unauthorized access is rejected"""
        parent_uic = self.units_created[0].uic
        response = self.unauthorized_client.get(
            f"/missions-flown-detail?uic={parent_uic}&mission_type={FlightMissionTypes.TRAINING}"
        )
        self.assertEqual(response.status_code, 401)

    def test_missions_flown_detail_invalid_mission_type(self):
        """Test endpoint behavior with invalid mission type"""
        parent_uic = self.units_created[0].uic
        response = self.client.get(f"/missions-flown-detail?uic={parent_uic}&mission_type=INVALID_TYPE")
        self.assertEqual(response.status_code, 422)  # Validation error

    def test_missions_flown_detail_subordinate_units(self):
        """Test that response includes missions from subordinate units"""
        parent_uic = self.units_created[0].uic
        response = self.client.get(
            f"/missions-flown-detail?uic={parent_uic}&mission_type={FlightMissionTypes.TRAINING}"
        )
        self.assertEqual(response.status_code, 200)
        # Get unique units from response
        response_units = {mission["unit"] for mission in response.data}
        # Verify we see missions from subordinate units
        unit_uics = {unit.uic for unit in self.units_created}
        self.assertTrue(response_units.issubset(unit_uics))

    def test_missions_flown_detail_hours_calculation(self):
        """Test that day and night hours are calculated correctly"""
        parent_uic = self.units_created[0].uic
        response = self.client.get(
            f"/missions-flown-detail?uic={parent_uic}&mission_type={FlightMissionTypes.TRAINING}"
        )
        self.assertEqual(response.status_code, 200)
        for mission in response.data:
            # Test flight setup creates missions with specific hour patterns
            if mission["day_mission_hours"]:
                self.assertEqual(mission["day_mission_hours"], 0.0)  # Based on test data setup
            if mission["night_mission_hours"]:
                self.assertGreater(mission["night_mission_hours"], 0.0)  # Based on test data setup

    def test_maintenance_time_good(self):
        """Test the maintenance time endpoint"""
        response = self.client.get(f"/maintenance-time?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"hours_worked": 480.0, "similar_average_hours": 48.0, "indicator": "good"})

    def test_maintenance_time_fair(self):
        """Test the maintenance time endpoint"""
        response = self.client.get(f"/maintenance-time?uic={self.other_units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data, {"hours_worked": 60.0, "similar_average_hours": 59.666666666666664, "indicator": "fair"}
        )

    def test_maintenance_time_poor(self):
        """Test the maintenance time endpoint"""
        response = self.client.get(f"/maintenance-time?uic={self.more_units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {"hours_worked": 12.0, "similar_average_hours": 60.333333333333336, "indicator": "poor"},
        )

    def test_maintenance_time_good_with_date(self):
        """Test the maintenance time endpoint"""
        response = self.client.get(
            f"/maintenance-time?uic={self.units_created[0].uic}&reporting_period={datetime.now().date()}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"hours_worked": 480.0, "similar_average_hours": 48.0, "indicator": "good"})
