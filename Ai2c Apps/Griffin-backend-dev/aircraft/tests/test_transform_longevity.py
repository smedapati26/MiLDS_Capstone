from datetime import datetime

from django.test import RequestFactory, TransactionTestCase, tag
from django.utils import timezone

from aircraft.models import PartLongevity
from aircraft.views.transforms import transform_longevity
from auto_dsr.models import RawSyncTimestamp
from utils.tests import (
    create_single_longevity,
    create_single_raw_longevity,
    create_single_test_aircraft,
    create_single_test_unit,
)


@tag("longevity_transformation")
class LongevityTransformationTest(TransactionTestCase):
    def setUp(self):
        # Units
        self.unit = create_single_test_unit()
        self.unit2 = create_single_test_unit(uic="ZZ-1234567")
        self.unit3 = create_single_test_unit(uic="YY-123456")

        self.aircraft = create_single_test_aircraft(current_unit=self.unit, serial="TESTAIRCRAFT1")
        self.aircraft2 = create_single_test_aircraft(current_unit=self.unit2, serial="TESTAIRCRAFT2")
        self.aircraft3 = create_single_test_aircraft(current_unit=self.unit3, serial="TESTAIRCRAFT3")

        self.raw_longevity = []
        self.longevity = create_single_longevity(
            x_2410_id=123456, uic=self.unit, aircraft=self.aircraft, responsible_uic=self.unit2
        )

        self.raw_longevity.append(
            create_single_raw_longevity(
                uic=self.unit.uic,
                aircraft_serial=self.aircraft.serial,
                maintenance_action_date=timezone.make_aware(datetime(2025, 1, 1, 11, 00)),
                x_2410_id=123456,
                outcome_fh=9.95,
                x_uic=self.unit2,
            )
        )
        self.raw_longevity.append(
            create_single_raw_longevity(
                uic=self.unit2.uic,
                aircraft_serial=self.aircraft2.serial,
                maintenance_action_date=timezone.make_aware(datetime(2025, 1, 1, 11, 00)),
                x_2410_id=234567,
            )
        )
        self.raw_longevity.append(
            create_single_raw_longevity(
                aircraft_serial=self.aircraft3.serial,
                maintenance_action_date=timezone.make_aware(datetime(2025, 1, 1, 11, 00)),
                x_2410_id=56789,
            )
        )

        self.raw_longevity.append(
            create_single_raw_longevity(
                uic=self.unit3.uic,
                aircraft_serial="NOTFOUND",
                maintenance_action_date=timezone.make_aware(datetime(2025, 1, 1, 11, 00)),
                x_2410_id=345678,
            )
        )

        self.factory = RequestFactory()

    def test_fault_translation(self):
        request = self.factory.get("/some-path/")
        response = transform_longevity(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 3 of 4 records, 1 skipped, 0 failed.")
        self.assertEqual(PartLongevity.objects.all().count(), 3)
