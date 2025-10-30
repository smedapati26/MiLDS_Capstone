import json
from datetime import datetime, time, timedelta

from dateutil.relativedelta import relativedelta
from django.test import TestCase, tag
from django.utils.timezone import make_aware, now
from ninja.testing import TestClient

from events.api.routes import events_router
from utils.tests import (
    create_single_maintenance_request,
    create_single_test_aircraft,
    create_single_test_insp_ref,
    create_single_test_inspection,
    create_single_test_maint_event,
    create_single_test_maintenance_lane,
    create_test_units,
    create_test_user,
)
from utils.tests.test_fault_creation import create_single_test_fault
from utils.time.reporting_periods import get_reporting_period


@tag("events")
class MaintenanceEventTest(TestCase):
    def setUp(self):
        # create unit to house test aircraft
        self.now = now()
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.begin_date = datetime.date(datetime.now().astimezone()) - timedelta(days=2)
        self.end_date = datetime.date(datetime.now().astimezone()) + timedelta(days=2)

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])
        self.admin_user = create_test_user(unit=self.units_created[0], user_id="0000000001", is_admin=True)
        # Create Maintenance Lane Needed for Event Creation
        self.lane = create_single_test_maintenance_lane(unit=self.units_created[0])
        self.lane2 = create_single_test_maintenance_lane(unit=self.units_created[1])
        # Create Aircraft Needed for Event Creation
        self.aircraft = create_single_test_aircraft(current_unit=self.units_created[0])
        self.aircraft2 = create_single_test_aircraft(current_unit=self.units_created[1], serial="AIR2")
        # Create Maintenance events including one to delete
        self.maintenance_event = create_single_test_maint_event(
            self.lane, self.aircraft, event_end=(self.now + timedelta(hours=-1))
        )
        self.maintenance_event = create_single_test_maint_event(
            self.lane2,
            self.aircraft2,
            event_start=(self.now - timedelta(days=1)),
            event_end=(self.now + timedelta(days=1)),
        )
        self.delete_event = create_single_test_maint_event(
            self.lane, self.aircraft, event_end=(self.now + timedelta(hours=-1))
        )

        # Create Phase event to validate Maintenance Events API
        self.phase_ref = create_single_test_insp_ref(is_phase=True)
        self.phase_event_1 = create_single_test_maint_event(
            self.lane, self.aircraft, inspection_reference=self.phase_ref, event_end=(self.now + timedelta(hours=-1))
        )
        self.phase_event_2 = create_single_test_maint_event(
            self.lane, self.aircraft, inspection_reference=self.phase_ref, event_end=(self.now + timedelta(hours=-1))
        )
        self.phase_event_3 = create_single_test_maint_event(
            self.lane, self.aircraft, inspection_reference=self.phase_ref, event_end=(self.now + timedelta(hours=-1))
        )

        self.client = TestClient(events_router, headers={"Auth-User": self.user.user_id})
        self.admin_client = TestClient(events_router, headers={"Auth-User": self.admin_user.user_id})
        self.unauthorized_client = TestClient(events_router, headers={"Auth-User": "FAKE_USER"})

        create_single_test_maint_event(
            self.lane,
            self.aircraft,
            event_start=(self.now - timedelta(days=1)),
            event_end=(self.now + timedelta(days=1)),
        )
        self.inspection = create_single_test_inspection(serial=self.aircraft, inspection_name="Test Inspection")

        self.maintenance_request = create_single_maintenance_request(
            lane=self.lane,
            aircraft=self.aircraft,
            user=self.user,
            unit=self.units_created[0],
        )

        tmp_ref = create_single_test_insp_ref(is_phase=False, code="FLS1")
        create_single_test_maint_event(
            self.lane,
            self.aircraft,
            event_start=(self.now - timedelta(days=1)),
            event_end=(self.now + timedelta(days=1)),
            inspection_reference=tmp_ref,
        )
        create_single_test_maint_event(
            self.lane,
            self.aircraft,
            event_start=(self.now - timedelta(days=1)),
            event_end=(self.now + timedelta(days=1)),
            inspection_reference=self.phase_ref,
        )

        self.fault_date = get_reporting_period()[1]
        self.fault_date_time = make_aware(datetime.combine(self.fault_date, time(00, 00, 00)))
        create_single_test_fault(
            self.aircraft, self.units_created[0], discovery_date_time=self.fault_date_time, vantage_id="0000-1111-2222"
        ),
        create_single_test_fault(
            self.aircraft,
            self.units_created[0],
            discovery_date_time=self.fault_date_time,
            when_discovered_code_value="K",
            vantage_id="0000-1111-2223",
        ),
        create_single_test_fault(
            self.aircraft,
            self.units_created[0],
            discovery_date_time=self.fault_date_time,
            when_discovered_code_value="C",
            vantage_id="0000-1111-2224",
        ),

    def test_maintenance_impact_valid(self):
        response = self.client.get(
            f"/maintenance-impact?uic={self.units_created[0].uic}&begin_date={self.begin_date}&end_date={self.end_date}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, 4)

    def test_maintenance_impact_invalid_unit(self):
        response = self.client.get(
            f"/maintenance-impact?uic=FAKEUNIT&begin_date={self.begin_date}&end_date={self.end_date}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, 0)

    def test_maintenance_impact_unauthorized_user(self):
        response = self.unauthorized_client.get(
            f"/maintenance-impact?uic={self.units_created[0].uic}&begin_date={self.begin_date}&end_date={self.end_date}"
        )
        self.assertEqual(response.status_code, 401)

    def test_list_maintenance_events_valid(self):
        response = self.client.get(
            f"/maintenance?uic={self.units_created[0].uic}&begin_date={self.begin_date}&end_date={self.end_date}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 9)
        self.assertEqual(response.data["items"][0]["notes"], "Test Notes")

    def test_list_maintenance_events_invalid_unit(self):
        response = self.client.get(f"/maintenance?uic=FAKEUNIT&begin_date={self.begin_date}&end_date={self.end_date}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)  # No lanes for Fake Unit

    def test_list_maintenance_events_unauthorized_user(self):
        response = self.unauthorized_client.get(
            f"/maintenance?uic={self.units_created[0].uic}&begin_date={self.begin_date}&end_date={self.end_date}"
        )
        self.assertEqual(response.status_code, 401)

    def test_create_maintenance_event_valid(self):
        event_dict = {
            "aircraft_id": self.aircraft.serial,
            "lane_id": self.lane.id,
            "event_start": self.begin_date,
            "event_end": self.end_date,
            "maintenance_type": "OTHER",
        }
        response = self.admin_client.post(
            f"/maintenance", data=json.dumps(event_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(type(response.data["id"]), int)

    def test_create_maintenance_event_invalid_content(self):
        event_dict = {
            "aircraft_id": self.aircraft.serial,
            "lane_id": self.lane.id,
            "event_start": self.begin_date,
            "event_end": self.end_date,
            "maintenance_type": 10,  # INVALID TYPE
        }
        response = self.admin_client.post(
            f"/maintenance", data=json.dumps(event_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 422)

    def test_create_maintenance_event_unauthorized_user(self):
        event_dict = {
            "aircraft_id": self.aircraft.serial,
            "lane_id": self.lane.id,
            "event_start": self.begin_date,
            "event_end": self.end_date,
            "maintenance_type": "OTHER",
        }
        response = self.unauthorized_client.post(
            f"/maintenance", data=json.dumps(event_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)

    def test_create_maintenance_event_no_permissions_user(self):
        event_dict = {
            "aircraft_id": self.aircraft.serial,
            "lane_id": self.lane.id,
            "event_start": self.begin_date,
            "event_end": self.end_date,
            "maintenance_type": "OTHER",
        }
        response = self.client.post(
            f"/maintenance", data=json.dumps(event_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)

    def test_read_maintenance_event_valid(self):
        response = self.client.get(f"/maintenance/{self.maintenance_event.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["maintenance_type"], "Test Type")

    def test_read_maintenance_event_invalid_event(self):
        response = self.client.get("/maintenance/200")
        self.assertEqual(response.status_code, 404)

    def test_read_maintenance_event_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/maintenance/{self.maintenance_event.id}")
        self.assertEqual(response.status_code, 401)

    def test_update_maintenance_event_valid(self):
        event_dict = {"notes": "Test Updated Notes"}
        response = self.admin_client.put(
            f"/maintenance/{self.maintenance_event.id}", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)

    def test_update_maintenance_event_invalid_content(self):
        event_dict = {"notes": 10}  # incorrect type
        response = self.admin_client.put(
            f"/maintenance/{self.maintenance_event.id}", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 422)

    def test_update_maintenance_event_invalid_event(self):
        event_dict = {"notes": "Test Updated Notes"}
        response = self.admin_client.put(
            f"/maintenance/100", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)

    def test_update_maintenance_event_unauthorized_user(self):
        event_dict = {"notes": "Test Updated Notes"}
        response = self.unauthorized_client.put(
            f"/maintenance/{self.maintenance_event.id}", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)

    def test_update_maintenance_event_no_permissions_user(self):
        event_dict = {"notes": "Test Updated Notes"}
        response = self.client.put(
            f"/maintenance/{self.maintenance_event.id}", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)

    def test_delete_maintenance_event_valid(self):
        response = self.admin_client.delete(f"/maintenance/{self.delete_event.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)

    def test_delete_maintenance_event_invalid_event(self):
        response = self.client.delete("/maintenance/200")
        self.assertEqual(response.status_code, 404)

    def test_delete_maintenance_event_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/maintenance/{self.maintenance_event.id}")
        self.assertEqual(response.status_code, 401)

    def test_delete_maintenance_event_no_permissions_user(self):
        response = self.client.delete(f"/maintenance/{self.maintenance_event.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)

    def test_upcoming_maintenance_event(self):
        response = self.client.get(f"/upcoming-maintenance?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 4)
        for x in range(0, len(response.data)):
            self.assertGreaterEqual(
                make_aware(datetime.strptime(response.data[x]["event_end"], "%Y-%m-%dT%H:%M:%S.%fZ")),
                self.now,
            )

    def test_upcoming_maintenance_event_other_uics(self):
        response = self.client.get(
            f"/upcoming-maintenance?uic={self.units_created[0].uic}&other_uics={self.units_created[1].uic}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        for x in range(0, len(response.data)):
            self.assertGreaterEqual(
                make_aware(datetime.strptime(response.data[x]["event_end"], "%Y-%m-%dT%H:%M:%S.%fZ")),
                self.now,
            )

    def test_upcoming_maintenance_event_no_uic(self):
        response = self.client.get("/upcoming-maintenance")
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.data["message"], "Either UIC or Other UICs are required.")

    def test_upcoming_maintenance_event_phase_true(self):
        response = self.client.get(f"/upcoming-maintenance?uic={self.units_created[0].uic}&is_phase=true")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        for x in range(0, len(response.data)):
            self.assertGreaterEqual(
                make_aware(datetime.strptime(response.data[x]["event_end"], "%Y-%m-%dT%H:%M:%S.%fZ")),
                self.now,
            )
            self.assertTrue(response.data[x]["is_phase"])

    def test_upcoming_maintenance_event_phase_false(self):
        response = self.client.get(f"/upcoming-maintenance?uic={self.units_created[0].uic}&is_phase=false")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)
        for x in range(0, len(response.data)):
            self.assertGreaterEqual(
                make_aware(datetime.strptime(response.data[x]["event_end"], "%Y-%m-%dT%H:%M:%S.%fZ")),
                self.now,
            )
            self.assertFalse(response.data[x]["is_phase"])

    def test_maintenance_counts(self):
        expected = [
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-24)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-23)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-22)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-21)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-20)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-19)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-18)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-17)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-16)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-15)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-14)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-13)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-12)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-11)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-10)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-9)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-8)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-7)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-6)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-5)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-4)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-3)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-2)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-1)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format(self.fault_date),
                "unscheduled": 2,
                "scheduled": 1,
            },
        ]
        response = self.client.get(f"/maintenance-counts?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 25)
        self.assertEqual(response.data, expected)

    def test_maintenance_counts_specific_dates(self):
        expected = [
            {
                "reporting_period": "{}".format((self.fault_date + relativedelta(months=-1)).strftime("%Y-%m-%d")),
                "unscheduled": 0,
                "scheduled": 0,
            },
            {
                "reporting_period": "{}".format(self.fault_date),
                "unscheduled": 2,
                "scheduled": 1,
            },
        ]
        start_date = (self.fault_date + relativedelta(months=-1)).strftime("%Y-%m-%d")
        response = self.client.get(
            f"/maintenance-counts?uic={self.units_created[0].uic}&start_date={start_date}&end_date={self.fault_date}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data, expected)

    def test_dsr_maintenance_detail(self):
        expected = [
            {
                "serial": "TESTAIRCRAFT",
                "model": "TH-10A",
                "inspection_name": "None",
                "status": 0.5,
                "lane_name": "TEST LANE",
                "responsible_unit": "100th TEST",
                "start_date": "{}Z".format((self.now - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]),
                "end_date": "{}Z".format((self.now + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]),
                "current_upcoming": "current",
            },
            {
                "serial": "TESTAIRCRAFT",
                "model": "TH-10A",
                "inspection_name": "TESTINSP",
                "status": 0.5,
                "lane_name": "TEST LANE",
                "responsible_unit": "100th TEST",
                "start_date": "{}Z".format((self.now - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]),
                "end_date": "{}Z".format((self.now + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]),
                "current_upcoming": "current",
            },
            {
                "serial": "TESTAIRCRAFT",
                "model": "TH-10A",
                "inspection_name": "TESTINSP",
                "status": 0.5,
                "lane_name": "TEST LANE",
                "responsible_unit": "100th TEST",
                "start_date": "{}Z".format((self.now - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]),
                "end_date": "{}Z".format((self.now + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]),
                "current_upcoming": "current",
            },
            {
                "serial": "AIR2",
                "model": "TH-10A",
                "inspection_name": "None",
                "status": 0.5,
                "lane_name": "TEST LANE",
                "responsible_unit": "A CO, 100th TEST",
                "start_date": "{}Z".format((self.now - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]),
                "end_date": "{}Z".format((self.now + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]),
                "current_upcoming": "current",
            },
        ]
        response = self.client.get(f"/dsr-maintenance-detail?uic={self.units_created[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_get_maintenance_request(self):
        response = self.client.get(f"/maintenance-request/{self.maintenance_request.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.maintenance_request.id)

    def test_create_maintenance_request(self):
        payload = {
            "requested_maintenance_lane_id": self.lane.id,
            "requested_aircraft_id": self.aircraft2.serial,
            "requested_by_user_id": self.user.user_id,
            "requested_maintenance_type": "OTHER",
            "requested_inspection": None,
            "requested_inspection_reference": None,
            "name": "Test Maintenance",
            "requested_start": self.now.isoformat(),
            "requested_end": (self.now + timedelta(hours=2)).isoformat(),
            "notes": "Test notes",
            "poc": self.user.user_id,
            "alt_poc": None,
            "requested_by_uic_id": self.units_created[0].uic,
            "date_requested": self.now.date().isoformat(),
            "decision_date": (self.now + timedelta(days=1)).date().isoformat(),
            "maintenance_approved": True,
        }
        response = self.admin_client.post("/maintenance-request", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["id"], 2)

        response = self.unauthorized_client.post("/maintenance-request", json=payload)
        self.assertEqual(response.status_code, 401)

    def test_update_maintenance_request(self):
        payload = {
            "requested_maintenance_lane_id": self.lane.id,
            "requested_aircraft_id": self.aircraft2.serial,
            "requested_maintenance_type": "OTHER",
            "requested_inspection_id": self.inspection.id,
            "requested_inspection_reference_id": self.phase_ref.id,
            "name": "Updated Maintenance",
            "requested_start": self.now.isoformat(),
            "requested_end": (self.now + timedelta(hours=2)).isoformat(),
            "notes": "Updated notes",
            "poc": self.user.user_id,
            "alt_poc": None,
            "requested_by_uic": self.maintenance_request.requested_by_uic.uic,
            "requested_by_uic_id": self.maintenance_request.requested_by_uic.uic,
            "requested_by_uic_short_name": self.maintenance_request.requested_by_uic.short_name,
            "requested_by_user_id": self.maintenance_request.requested_by_user.user_id,
            "requested_by_user_first_name": self.maintenance_request.requested_by_user.first_name,
            "requested_by_user_last_name": self.maintenance_request.requested_by_user.last_name,
            "date_requested": self.now.date().isoformat(),
            "decision_date": (self.now + timedelta(days=1)).date().isoformat(),
            "maintenance_approved": True,
        }
        response = self.admin_client.put(
            f"/maintenance-request/{self.maintenance_request.id}", json.dumps(payload), content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response.data["id"], 1)
        self.assertEqual(response_data["name"], "Updated Maintenance")
        self.assertEqual(response_data["notes"], "Updated notes")
        self.assertEqual(
            response_data["requested_maintenance_lane"], {"name": "TEST LANE", "contractor": False, "internal": True}
        )
        self.assertEqual(response_data["requested_aircraft"]["serial"], self.aircraft2.serial)
        self.assertEqual(response_data["requested_by_user"]["user_id"], self.user.user_id)
        self.assertEqual(response_data["requested_by_uic"]["uic"], self.maintenance_request.requested_by_uic.uic)
        self.assertEqual(response_data["requested_maintenance_type"], "OTHER")
        self.assertEqual(
            response_data["requested_inspection"], {"inspection_name": "Test Inspection", "hours_interval": None}
        )
        self.assertEqual(
            response_data["requested_inspection_reference"],
            {"id": 1, "common_name": "TESTINSP", "code": "TEST", "is_phase": True},
        )
        self.assertEqual(response_data["date_requested"], self.now.date().isoformat())
        self.assertEqual(response_data["decision_date"], (self.now + timedelta(days=1)).date().isoformat())
        self.assertTrue(response_data["maintenance_approved"])

        response = self.unauthorized_client.put(
            f"/maintenance-request/{self.maintenance_request.id}", json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)

    def test_delete_maintenance_request(self):
        response = self.admin_client.delete(f"/maintenance-request/{self.maintenance_request.id}")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")

        response = self.unauthorized_client.delete(f"/maintenance-request/{self.maintenance_request.id}")
        self.assertEqual(response.status_code, 401)
