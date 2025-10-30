from datetime import datetime, time, timedelta

from django.test import TestCase, tag
from django.utils.timezone import make_aware, now
from ninja.testing import TestClient

from aircraft.models import Inspection
from auto_dsr.models import Unit
from events.api.routes import events_router
from events.models import Event
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_donsa_event,
    create_single_test_insp_ref,
    create_single_test_maint_event,
    create_single_test_maintenance_lane,
    create_single_test_training_event,
    create_test_location,
    create_test_units,
    create_test_user,
)
from utils.tests.test_fault_creation import create_single_test_fault
from utils.time.reporting_periods import get_reporting_period
from utils.transform.update_inspections import update_inspections


@tag("events")
class EventCalendarTest(TestCase):
    def setUp(self):
        # create unit to house test aircraft
        self.now = now()
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.begin_date = datetime.date(self.now) - timedelta(days=1)
        self.end_date = datetime.date(self.now) + timedelta(days=1)
        self.location = create_test_location()

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])
        self.admin_user = create_test_user(unit=self.units_created[0], user_id="0000000001", is_admin=True)
        # Create donsa events including one to delete
        self.donsa_event = create_single_test_donsa_event(
            self.units_created[0],
            applies_to=Unit.objects.get(uic=self.units_created[0].uic).subordinate_unit_hierarchy(include_self=True),
            name="WITH APPLIES TO",
        )
        self.delete_event = create_single_test_donsa_event(self.units_created[0])

        self.client = TestClient(events_router, headers={"Auth-User": self.user.user_id})
        self.admin_client = TestClient(events_router, headers={"Auth-User": self.admin_user.user_id})
        self.unauthorized_client = TestClient(events_router, headers={"Auth-User": "FAKE_USER"})

        # Create Maintenance Lane Needed for Event Creation
        self.lane = create_single_test_maintenance_lane(unit=self.units_created[0])
        # Create Aircraft Needed for Event Creation
        self.aircraft = create_single_test_aircraft(current_unit=self.units_created[0], model="TH-60A")
        update_inspections(self.aircraft, 0.1, 0.2, 0.3, "TEST")
        self.inspections = Inspection.objects.filter(serial=self.aircraft)
        # Create Maintenance events including one to delete
        self.maintenance_event = create_single_test_maint_event(
            self.lane, self.aircraft, event_end=(self.now + timedelta(hours=-1)), inspection=self.inspections[0]
        )
        self.delete_event = create_single_test_maint_event(
            self.lane, self.aircraft, event_end=(self.now + timedelta(hours=-1)), name="NO INSPECTION"
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

        create_single_test_maint_event(self.lane, self.aircraft, event_end=(self.now + timedelta(days=1)))
        tmp_ref = create_single_test_insp_ref(is_phase=False, code="FLS1")
        create_single_test_maint_event(
            self.lane,
            self.aircraft,
            event_end=(self.now + timedelta(days=1)),
            inspection_reference=tmp_ref,
        )
        create_single_test_maint_event(
            self.lane,
            self.aircraft,
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

        # Create Training events including one to delete
        self.training_event = create_single_test_training_event(
            self.units_created[0],
            applies_to=Unit.objects.get(uic=self.units_created[0].uic).subordinate_unit_hierarchy(include_self=True),
            name="WITH APPLIES TO",
            aircraft=[self.aircraft],
            location=self.location,
        )
        self.delete_event = create_single_test_training_event(
            self.units_created[0], aircraft=[self.aircraft], location=self.location
        )

        # Create events outside date range
        create_single_test_maint_event(
            self.lane,
            self.aircraft,
            event_start=(self.now + timedelta(days=30)),
            event_end=(self.now + timedelta(days=31)),
        )
        create_single_test_training_event(
            self.units_created[0],
            event_start=(self.now - timedelta(days=31)),
            event_end=(self.now - timedelta(days=30)),
        )

        # Create events with one date in range
        create_single_test_maint_event(
            self.lane,
            self.aircraft,
            event_start=(self.now),
            event_end=(self.now + timedelta(days=31)),
        )
        create_single_test_training_event(
            self.units_created[0],
            event_start=(self.now - timedelta(days=31)),
            event_end=(self.now),
        )

    def test_list_training_events_valid(self):
        response = self.client.get(
            f"/event-calendar?uic={self.units_created[0].uic}&start_date={self.begin_date}&end_date={self.end_date}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 14)

    def test_applies_to_events(self):
        test_uic = Unit.objects.get(uic=self.units_created[0].uic).subordinate_unit_hierarchy(include_self=False)[1]
        response = self.client.get(
            f"/event-calendar?uic={test_uic}&start_date={self.begin_date}&end_date={self.end_date}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        for event in response.data:
            self.assertIn(event["type"], ["OTHER", "DONSA"])
            self.assertEqual(event["name"], "WITH APPLIES TO")
            self.assertEqual(event["uic"], test_uic)
