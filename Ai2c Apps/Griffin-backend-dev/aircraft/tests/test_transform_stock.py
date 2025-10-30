from datetime import timedelta

from django.test import RequestFactory, TransactionTestCase, tag
from django.utils import timezone

from aircraft.models import Stock
from aircraft.views.transforms import transform_stock
from auto_dsr.models import RawSyncTimestamp
from utils.tests import create_single_raw_stock, create_single_stock
from utils.tests.test_unit_creation import create_single_test_unit


@tag("stock_transformation")
class LongevityTransformationTest(TransactionTestCase):
    def setUp(self):
        # Units
        self.unit = create_single_test_unit()
        self.unit2 = create_single_test_unit(uic="ZZ-1234567")
        self.unit3 = create_single_test_unit(uic="YY-123456")

        self.raw_stock = []
        self.stock = create_single_stock(uic=self.unit, stock_id="TSTSTK1")

        self.raw_stock.append(
            create_single_raw_stock(uic=self.unit.uic, sloc_description_uic=self.unit3.uic, stock_id="TSTSTK1")
        )
        self.raw_stock.append(
            create_single_raw_stock(uic=self.unit2.uic, sloc_description_uic=self.unit3.uic, stock_id="TSTSTK2")
        )
        self.raw_stock.append(
            create_single_raw_stock(
                uic=self.unit.uic,
                sloc_description_uic=self.unit3.uic,
                stock_id="TSTSTK3",
                centaur_sync_timestamp=timezone.now(),
            )
        )

        self.factory = RequestFactory()

    def test_fault_translation(self):
        request = self.factory.get("/some-path/")
        response = transform_stock(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 3 of 3 records, 0 skipped, 0 failed.")
        self.assertEqual(Stock.objects.all().count(), 3)

    def test_fault_translation_with_last_sync(self):
        RawSyncTimestamp.objects.create(table="raw_stock", most_recent_sync=timezone.now() - timedelta(days=3))
        request = self.factory.get("/some-path/")
        response = transform_stock(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 1 of 3 records, 2 skipped, 0 failed.")
        self.assertEqual(Stock.objects.all().count(), 2)
