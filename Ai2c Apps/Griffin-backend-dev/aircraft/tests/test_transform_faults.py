from datetime import datetime

from django.test import RequestFactory, TransactionTestCase, tag
from django.utils import timezone

from aircraft.models import Fault
from aircraft.utils import get_status_code
from aircraft.views.transforms import transform_faults
from auto_dsr.models import RawSyncTimestamp
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_fault,
    create_single_test_raw_fault,
    create_single_test_unit,
)


@tag("fault_transform")
class FaultTransformTest(TransactionTestCase):
    def setUp(self):
        # Units
        self.unit = create_single_test_unit()
        self.unit2 = create_single_test_unit(uic="ZZ-1234567")
        self.unit3 = create_single_test_unit(uic="YY-123456")

        self.aircraft = create_single_test_aircraft(current_unit=self.unit, serial="TESTAIRCRAFT1")
        self.aircraft2 = create_single_test_aircraft(current_unit=self.unit2, serial="TESTAIRCRAFT2")
        self.aircraft3 = create_single_test_aircraft(current_unit=self.unit3, serial="TESTAIRCRAFT3")

        self.raw_fault = []
        self.fault = create_single_test_fault(unit=self.unit, aircraft=self.aircraft)

        self.raw_fault.append(
            create_single_test_raw_fault(
                uic=self.unit.uic,
                serial=self.aircraft.serial,
                discovery_date_time=timezone.make_aware(datetime(2025, 1, 1, 11, 00)),
                corrective_date_time=None,
                id="0000-1111-2222",
                remarks="Test1",
            )
        )
        self.raw_fault.append(
            create_single_test_raw_fault(
                uic=self.unit2.uic,
                serial=self.aircraft2.serial,
                discovery_date_time=timezone.make_aware(datetime(2024, 1, 1, 11, 00)),
                corrective_date_time=timezone.make_aware(datetime(2025, 2, 1, 11, 00)),
                id="9999-8888-7777",
                status_code_value="+",
                remarks="Test2",
            )
        )
        self.raw_fault.append(
            create_single_test_raw_fault(
                uic=self.unit3.uic,
                serial=self.aircraft3.serial,
                discovery_date_time=timezone.make_aware(datetime(2024, 1, 1, 11, 00)),
                corrective_date_time=timezone.make_aware(datetime(2024, 2, 1, 11, 00)),
                id="1234-5678-9012",
                status_code_value="/",
                remarks="Test3",
            )
        )
        self.last_sync = RawSyncTimestamp.objects.create(
            table="aircraft_rawfault", most_recent_sync=timezone.make_aware(datetime(2024, 3, 1, 11, 00))
        )
        self.factory = RequestFactory()

    def test_fault_translation(self):
        request = self.factory.get("/some-path/")
        response = transform_faults(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Created 2 Faults, Updated 0")
        self.assertEqual(Fault.objects.all().count(), 3)

    def test_fault_translation_no_filter(self):
        request = self.factory.get("/some-path?all_faults=true")
        response = transform_faults(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Created 3 Faults, Updated 0")
        self.assertEqual(Fault.objects.all().count(), 4)

    def test_fault_translation_update(self):
        create_single_test_raw_fault(
            id=self.fault.vantage_id,
            serial=self.fault.aircraft.serial,
            uic=self.fault.unit.uic,
            corrective_date_time=timezone.make_aware(datetime(2025, 2, 1, 11, 00)),
            status_code_value="X",
        )
        request = self.factory.get("/some-path")
        response = transform_faults(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Created 2 Faults, Updated 1")
        self.assertEqual(Fault.objects.all().count(), 3)

    def test_get_status_code(self):
        self.assertTrue(get_status_code("+"), Fault.TechnicalStatus.CIRCLE_X)
        self.assertTrue(get_status_code("-"), Fault.TechnicalStatus.DASH)
        self.assertTrue(get_status_code("/"), Fault.TechnicalStatus.DIAGONAL)
        self.assertTrue(get_status_code("X"), Fault.TechnicalStatus.DEADLINE)
        self.assertTrue(get_status_code("N"), Fault.TechnicalStatus.NUCLEAR)
        self.assertTrue(get_status_code("B"), Fault.TechnicalStatus.BIOLOGICAL)
        self.assertTrue(get_status_code("C"), Fault.TechnicalStatus.CHEMICAL)
        self.assertTrue(get_status_code("E"), Fault.TechnicalStatus.ADMIN_DEADLINE)
        self.assertTrue(get_status_code("1"), Fault.TechnicalStatus.NO_STATUS)
