import random
import string
from datetime import date, datetime, time

from django.test import TestCase, tag
from django.utils.timezone import make_aware
from ninja.testing import TestClient

from aircraft.model_utils.flight_mission_types import FlightMissionTypes
from aircraft.models import DA_1352
from auto_dsr.api.routes import auto_dsr_router
from auto_dsr.models import Unit
from utils.tests import (
    create_single_test_flight,
    create_test_aircraft_in_all,
    create_test_location,
    create_test_monthly_projection,
    create_test_units,
    create_test_user,
)


@tag("auto_dsr", "dsr")
class AutoDSRReportTests(TestCase):
    """
    Test suite the NINJA Auto DSR Report Endpoints
    """

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
            short_name="101th TEST",
            display_name="101th Test Aviation Regiment",
        )

        # Created units returns all units, not just ones created
        # Since this test will have multiple units, filter out based on the units created above
        self.units_created = self.units_created.filter(uic__startswith="TEST000")
        self.other_units_created = self.other_units_created.filter(uic__startswith="TESTA00")

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])

        # Create Aircraft in Unit
        self.unit_aircraft = create_test_aircraft_in_all(self.units_created)
        self.other_unit_aircraft = create_test_aircraft_in_all(self.other_units_created)
        self.client = TestClient(auto_dsr_router, headers={"Auth-User": self.user.user_id})
        self.unauthorized_client = TestClient(auto_dsr_router, headers={"Auth-User": "FAKE_USER"})

        # Create test DA_1352 records
        self.base_date = date(2023, 1, 15)
        self.test_1352s = []
        self.test_flights = []
        self.other_test_1352s = []
        self.other_test_flights = []

        self.location_1 = create_test_location()
        self.location_2 = create_test_location()

        # Create dates for API calls
        self.reporting_start_date = datetime.now()

        # Create records for each aircraft
        create_test_monthly_projection(unit=self.units_created[0])
        create_test_monthly_projection(unit=self.other_units_created[0])
        for aircraft in self.unit_aircraft:
            for month_offset in range(3):  # Create 3 months of data
                report_date = date(self.reporting_start_date.year, self.reporting_start_date.month + month_offset, 15)
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
                        start_datetime=make_aware(datetime.combine(report_date, time(00, 19, 0))),
                    )
                )
                self.test_flights.append(
                    create_single_test_flight(
                        aircraft=aircraft,
                        unit=aircraft.current_unit,
                        flight_id="".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(64)),
                        mission_type=FlightMissionTypes.SERVICE,
                        start_datetime=make_aware(datetime.combine(report_date, time(6, 19, 0))),
                    )
                )

        # Create other records for each aircraft
        for aircraft in self.other_unit_aircraft:
            for month_offset in range(3):  # Create 3 months of data
                report_date = date(self.reporting_start_date.year, self.reporting_start_date.month + month_offset, 15)
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

    def test_flying_hours(self):
        response = self.client.get(f"/flying-hours?uic={self.units_created[0].uic}")
        expected = {
            "monthly_hours_flown": 40.0,
            "monthly_hours_total": 400.0,
            "yearly_hours_flown": 40.0,
            "yearly_hours_total": 4400.0,
        }
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_models_location(self):
        response = self.client.get(f"/models/location?limit=10&offset=0")
        self.assertEqual(response.status_code, 200)

        expected = {
            "items": [{"id": 1, "code": "LC0", "name": "Location 0"}, {"id": 2, "code": "LC1", "name": "Location 1"}],
            "count": 2,
        }
        self.assertEqual(response.data, expected)
