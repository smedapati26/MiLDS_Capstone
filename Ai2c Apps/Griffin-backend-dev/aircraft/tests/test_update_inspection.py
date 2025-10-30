import pandas as pd
from django.test import TestCase, tag

from aircraft.models import Inspection
from utils.tests import create_single_test_aircraft, create_test_units, get_default_top_unit
from utils.transform.update_inspections import update_inspections


@tag("aircraft", "transform")
class UpdatePhaseTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.blackhawk = create_single_test_aircraft(
            current_unit=self.unit,
            model="UH-60M",
            total_airframe_hours=600,
            hours_to_phase=180,
        )

    def test_basic_update(self):
        blackhawk_inspections = [20.0, 100.0, None]
        blackhawk_series = pd.Series(blackhawk_inspections, index=["insp_1", "insp_2", "insp_3"])
        update_inspections(
            self.blackhawk, blackhawk_series["insp_1"], blackhawk_series["insp_2"], blackhawk_series["insp_3"], "CAMMS"
        )
        self.assertEqual(Inspection.objects.all().count(), 2)
        self.assertEqual(Inspection.objects.filter(inspection_name="40 Hour").count(), 1)
        self.assertEqual(Inspection.objects.filter(inspection_name="120 Hour").count(), 1)
        forty = Inspection.objects.get(serial=self.blackhawk, inspection_name="40 Hour")
        self.assertEqual(forty.last_conducted_hours, 580.0)
        self.assertEqual(forty.next_due_hours, 620.0)
        one_twenty = Inspection.objects.get(serial=self.blackhawk, inspection_name="120 Hour")
        self.assertEqual(one_twenty.last_conducted_hours, 580.0)
        self.assertEqual(one_twenty.next_due_hours, 700.0)
        reset_inspections = [40.0, 120.0, None]
        reset_series = pd.Series(reset_inspections, index=["insp_1", "insp_2", "insp_3"])
        update_inspections(
            self.blackhawk, reset_series["insp_1"], reset_series["insp_2"], reset_series["insp_3"], "CAMMS"
        )
        self.assertEqual(Inspection.objects.all().count(), 2)
        self.assertEqual(Inspection.objects.filter(inspection_name="40 Hour").count(), 1)
        self.assertEqual(Inspection.objects.filter(inspection_name="120 Hour").count(), 1)
        forty = Inspection.objects.get(serial=self.blackhawk, inspection_name="40 Hour")
        self.assertEqual(forty.last_conducted_hours, 600.0)
        self.assertEqual(forty.next_due_hours, 640.0)
        one_twenty = Inspection.objects.get(serial=self.blackhawk, inspection_name="120 Hour")
        self.assertEqual(one_twenty.last_conducted_hours, 600.0)
        self.assertEqual(one_twenty.next_due_hours, 720.0)

    def test_with_na(self):
        blackhawk_inspections = [20.0, None, None]
        blackhawk_series = pd.Series(blackhawk_inspections, index=["insp_1", "insp_2", "insp_3"])
        update_inspections(
            self.blackhawk, blackhawk_series["insp_1"], blackhawk_series["insp_2"], blackhawk_series["insp_3"], "CAMMS"
        )
        self.assertEqual(Inspection.objects.all().count(), 1)
        self.assertEqual(Inspection.objects.filter(inspection_name="40 Hour").count(), 1)
        self.assertEqual(Inspection.objects.filter(inspection_name="120 Hour").count(), 0)
        forty = Inspection.objects.get(serial=self.blackhawk, inspection_name="40 Hour")
        self.assertEqual(forty.last_conducted_hours, 580.0)
        self.assertEqual(forty.next_due_hours, 620.0)
        reset_inspections = [40.0, None, None]
        reset_series = pd.Series(reset_inspections, index=["insp_1", "insp_2", "insp_3"])
        update_inspections(
            self.blackhawk, reset_series["insp_1"], reset_series["insp_2"], reset_series["insp_3"], "CAMMS"
        )
        self.assertEqual(Inspection.objects.all().count(), 1)
        self.assertEqual(Inspection.objects.filter(inspection_name="40 Hour").count(), 1)
        self.assertEqual(Inspection.objects.filter(inspection_name="120 Hour").count(), 0)
        forty = Inspection.objects.get(serial=self.blackhawk, inspection_name="40 Hour")
        self.assertEqual(forty.last_conducted_hours, 600.0)
        self.assertEqual(forty.next_due_hours, 640.0)

    def test_with_gcss_a(self):
        blackhawk_inspections = [20.0, None, None]
        blackhawk_series = pd.Series(blackhawk_inspections, index=["insp_1", "insp_2", "insp_3"])
        update_inspections(
            self.blackhawk, blackhawk_series["insp_1"], blackhawk_series["insp_2"], blackhawk_series["insp_3"], "GCSS"
        )
        self.assertEqual(Inspection.objects.all().count(), 0)
