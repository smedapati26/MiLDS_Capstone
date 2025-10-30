import datetime

from django.test import TestCase, tag
from django.utils import timezone
from ninja.testing import TestClient

from aircraft.api.faults.routes import faults_router
from aircraft.models import Fault
from utils.tests import create_single_test_aircraft, create_single_test_fault, create_test_units, create_test_user


@tag("faults")
class FaultTest(TestCase):
    def setUp(self):
        # create unit to house test aircraft
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])
        # Create Aircraft in Unit
        self.aircraft = create_single_test_aircraft(self.units_created[0])
        # create fault
        self.faults = [
            create_single_test_fault(self.aircraft, self.units_created[0], vantage_id="0000-1111-2222"),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                status_code_value=Fault.TechnicalStatus.DEADLINE,
                status_code_meaning="X",
                vantage_id="0000-1111-2223",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                status_code_value=Fault.TechnicalStatus.DEADLINE,
                status_code_meaning="X",
                vantage_id="0000-1111-2224",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 1, 1, 11, 00),
                ),
                status_code_value=Fault.TechnicalStatus.NO_STATUS,
                vantage_id="0000-1111-2225",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 1, 1, 11, 00),
                ),
                status_code_value=Fault.TechnicalStatus.CLEARED,
                vantage_id="0000-1111-2226",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 2, 1, 11, 00),
                ),
                status_code_value=Fault.TechnicalStatus.TI_CLEARED,
                vantage_id="0000-1111-2227",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 2, 1, 12, 00),
                ),
                status_code_value=Fault.TechnicalStatus.TI_CLEARED,
                vantage_id="0000-1111-2228",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 2, 1, 13, 00),
                ),
                status_code_value=Fault.TechnicalStatus.TI_CLEARED,
                vantage_id="0000-1111-2229",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 2, 1, 13, 00),
                ),
                status_code_value=Fault.TechnicalStatus.DIAGONAL,
                vantage_id="0000-1111-2230",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 2, 1, 2, 00),
                ),
                status_code_value=Fault.TechnicalStatus.DIAGONAL,
                vantage_id="0000-1111-2231",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 2, 1, 2, 00),
                ),
                status_code_value=Fault.TechnicalStatus.DASH,
                vantage_id="0000-1111-2232",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 3, 1, 2, 00),
                ),
                status_code_value=Fault.TechnicalStatus.ADMIN_DEADLINE,
                vantage_id="0000-1111-2233",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 3, 1, 2, 00),
                ),
                status_code_value=Fault.TechnicalStatus.DEADLINE,
                vantage_id="0000-1111-2234",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 3, 1, 5, 00),
                ),
                status_code_value=Fault.TechnicalStatus.DEADLINE,
                vantage_id="0000-1111-2235",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 4, 1, 5, 00),
                ),
                status_code_value=Fault.TechnicalStatus.CIRCLE_X,
                vantage_id="0000-1111-2236",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 4, 1, 5, 00),
                ),
                status_code_value=Fault.TechnicalStatus.NUCLEAR,
                vantage_id="0000-1111-2237",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 4, 1, 5, 00),
                ),
                status_code_value=Fault.TechnicalStatus.CHEMICAL,
                vantage_id="0000-1111-2238",
            ),
            create_single_test_fault(
                self.aircraft,
                self.units_created[0],
                discovery_date_time=timezone.make_aware(
                    datetime.datetime(2024, 4, 1, 5, 00),
                ),
                status_code_value=Fault.TechnicalStatus.BIOLOGICAL,
                vantage_id="0000-1111-2239",
            ),
        ]
        self.client = TestClient(faults_router, headers={"Auth-User": self.user.user_id})

    def test_fault_response(self):
        expected = [
            {
                "reporting_period": "2024-01-15",
                "no_status": 1,
                "cleared": 1,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-02-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 3,
                "diagonal": 2,
                "dash": 1,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-03-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 1,
                "deadline": 2,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-04-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 1,
                "nuclear": 1,
                "chemical": 1,
                "biological": 1,
            },
            {
                "reporting_period": "2024-05-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-06-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-07-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-08-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-09-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-10-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-11-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2024-12-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 1,
                "admin_deadline": 0,
                "deadline": 2,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
            {
                "reporting_period": "2025-01-15",
                "no_status": 0,
                "cleared": 0,
                "ti_cleared": 0,
                "diagonal": 0,
                "dash": 0,
                "admin_deadline": 0,
                "deadline": 0,
                "circle_x": 0,
                "nuclear": 0,
                "chemical": 0,
                "biological": 0,
            },
        ]
        response = self.client.get(
            f"/faults-over-time?uic={self.units_created[0].uic}&start_date=2024-01-01&end_date=2024-12-31"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)
