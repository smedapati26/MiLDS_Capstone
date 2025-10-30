from django.test import TestCase, tag

from aircraft.models import Phase
from utils.tests import create_single_test_aircraft, create_test_units, get_default_top_unit
from utils.transform.update_phase import update_phase


@tag("aircraft", "transform")
class UpdatePhaseTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(
            current_unit=self.unit, total_airframe_hours=600, hours_to_phase=180
        )

    def test_no_existing_phase_and_no_update(self):
        hours_to_phase = update_phase(self.aircraft, -1.111, "CAMMS")
        self.assertEqual(hours_to_phase, -1.111)

    def test_no_existing_phase_with_update(self):
        hours_to_phase = update_phase(self.aircraft, 478.0, "CAMMS")
        self.assertEqual(hours_to_phase, 478.0)
        self.assertEqual(Phase.objects.all().count(), 1)
        phase = Phase.objects.get(serial=self.aircraft)
        self.assertEqual(phase.last_conducted_hours, 598.0)
        self.assertEqual(phase.next_due_hours, 1078.0)

    def test_existing_phase_with_no_vantage_data(self):
        # Create phase object
        Phase.objects.create(
            serial=self.aircraft,
            last_conducted_hours=300.0,
            hours_interval=480.0,
            next_due_hours=780.0,
            phase_type="GEN",
        )
        hours_to_phase = update_phase(self.aircraft, -1.111, "CAMMS")
        self.assertEqual(hours_to_phase, 180.0)

    def test_existing_phase_with_vantage_data(self):
        # Create phase object
        Phase.objects.create(
            serial=self.aircraft,
            last_conducted_hours=300.0,
            hours_interval=480.0,
            next_due_hours=780.0,
            phase_type="GEN",
        )
        hours_to_phase = update_phase(self.aircraft, 188.0, "CAMMS")
        self.assertEqual(hours_to_phase, 180.0)

    def test_existing_phase_with_vantage_reset(self):
        # Create phase object
        Phase.objects.create(
            serial=self.aircraft,
            last_conducted_hours=116.0,
            hours_interval=480.0,
            next_due_hours=596.0,
            phase_type="GEN",
        )
        hours_to_phase = update_phase(self.aircraft, 476.0, "CAMMS")
        self.assertEqual(hours_to_phase, 476.0)

    def test_gcss_existing_phase_with_vantage_reset(self):
        # Create phase object
        Phase.objects.create(
            serial=self.aircraft,
            last_conducted_hours=216.0,
            hours_interval=480.0,
            next_due_hours=696.0,
            phase_type="GEN",
        )
        hours_to_phase = update_phase(self.aircraft, 476.0, "GCSS")
        self.assertEqual(hours_to_phase, 96.0)
