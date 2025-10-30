from django.test import RequestFactory, TransactionTestCase, override_settings, tag

from supply.models import AGSEWorkOrder, AircraftWorkOrder, ProvisionalStock, PurchaseOrder, UAVWorkOrder, WorkOrder
from supply.views.transforms import transform_provisional_stock, transform_purchase_order, transform_work_orders
from utils.tests import (
    create_single_test_provisional_stock,
    create_single_test_raw_provisional_stock,
    create_single_test_uav,
    create_single_test_unit,
)
from utils.tests.test_agse_creation import create_single_test_agse
from utils.tests.test_aircraft_creation import create_single_test_aircraft
from utils.tests.test_purchase_order_creation import (
    create_single_test_purchase_order,
    create_single_test_raw_purchase_order,
)
from utils.tests.test_work_order_creation import (
    create_single_test_agse_work_order,
    create_single_test_aircraft_work_order,
    create_single_test_generic_work_order,
    create_single_test_raw_work_order,
    create_single_test_uav_work_order,
)


@tag("supply_transform")
class SupplyTransformTest(TransactionTestCase):
    def setUp(self):
        # Units
        self.unit = create_single_test_unit()
        self.unit2 = create_single_test_unit(uic="ZZ-1234567")
        self.unit3 = create_single_test_unit(uic="YY-123456")

        # Equipment
        self.aircraft = create_single_test_aircraft(current_unit=self.unit, equipment_number="AIRCRAFT1")
        self.uav = create_single_test_uav(current_unit=self.unit, equipment_number="UAV1")
        self.agse = create_single_test_agse(current_unit=self.unit, equipment_number="AGSE1")

        # Provisional Stock
        self.raw_provisional_stock = []
        self.provisional_stock = create_single_test_provisional_stock(uic=self.unit, plant="PLANT1")
        self.raw_provisional_stock.append(
            create_single_test_raw_provisional_stock(uic=self.unit.uic, plant="PLANT1", support_ric="ABC")
        )
        self.raw_provisional_stock.append(create_single_test_raw_provisional_stock(uic=self.unit2.uic, plant="PLANT2"))
        self.raw_provisional_stock.append(create_single_test_raw_provisional_stock(uic="YY-1234567", plant="PLANT3"))

        # Work Orders
        self.raw_work_orders = []
        self.work_order = create_single_test_generic_work_order(order_number="WON123")
        self.aircraft_work_order = create_single_test_aircraft_work_order(
            order_number="ACWO123", aircraft=self.aircraft
        )
        self.uav_work_order = create_single_test_uav_work_order(uav=self.uav, order_number="UAV01234")
        self.agse_work_order = create_single_test_agse_work_order(agse=self.agse, order_number="AGSE123")

        self.raw_work_orders.append(
            create_single_test_raw_work_order(
                equipment_number="AIRCRAFT1", changed_by="John Doe", order_number="ACWO123"
            )
        )
        self.raw_work_orders.append(
            create_single_test_raw_work_order(equipment_number="AIRCRAFT1", order_number="ACWO456")
        )
        self.raw_work_orders.append(
            create_single_test_raw_work_order(equipment_number="AIRCRAFT2", order_number="ACWO789")
        )
        self.raw_work_orders.append(
            create_single_test_raw_work_order(equipment_number="UAV1", order_number="UAV01234", changed_by="Someone")
        )
        self.raw_work_orders.append(create_single_test_raw_work_order(equipment_number="UAV1", order_number="UAV9999"))
        self.raw_work_orders.append(create_single_test_raw_work_order(equipment_number="UAV2", order_number="UAV24601"))
        self.raw_work_orders.append(
            create_single_test_raw_work_order(equipment_number="AGSE1", order_number="AGSE123", changed_by="Noone")
        )
        self.raw_work_orders.append(
            create_single_test_raw_work_order(equipment_number="AGSE1", order_number="AGSE9999")
        )
        self.raw_work_orders.append(
            create_single_test_raw_work_order(equipment_number="AGSE2", order_number="AGSE8888")
        )

        # Purchase Orders
        self.raw_purchase_orders = []
        self.purchase_order = create_single_test_purchase_order(
            work_order_number=self.work_order,
            requisition_number="12345",
            requisition_item_number="ABCDE",
            order_item_number="OIN123",
            order_number="ON1234",
        )
        self.raw_purchase_orders.append(
            create_single_test_raw_purchase_order(
                requisition_number="12345",
                requisition_item_number="ABCDE",
                work_order_number=self.work_order.order_number,
                order_item_number="OIN123",
                order_number="ON1234",
                dollars_withdrawn=123.456,
            )
        )
        self.raw_purchase_orders.append(
            create_single_test_raw_purchase_order(
                requisition_number="678910",
                requisition_item_number="FGHIJ",
                work_order_number="WON456",
                order_item_number="OIN789",
                order_number="ON5678",
            )
        )
        self.raw_purchase_orders.append(
            create_single_test_raw_purchase_order(
                requisition_number="112233",
                requisition_item_number="KLMNO",
                work_order_number="WON789",
                order_item_number="OIN111",
                order_number="ON1122",
            )
        )

        self.factory = RequestFactory()

    @override_settings(DISABLE_TRANSACTION_ATOMIC_BLOCKS=True)
    def test_provisional_stock_translation(self):
        request = self.factory.get("/some-path/")
        response = transform_provisional_stock(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 2 of 3 records, 0 skipped, 1 failed.")
        # Test to make sure two records exist
        self.assertEqual(ProvisionalStock.objects.all().count(), 2)
        # Make sure the new item was created
        self.assertEqual(ProvisionalStock.objects.filter(uic="ZZ-1234567").count(), 1)
        # Make sure the non existent UIC was not created
        self.assertEqual(ProvisionalStock.objects.filter(uic="YY-1234567").count(), 0)
        # Make sure the existing item was updated
        self.assertEqual(ProvisionalStock.objects.get(uic=self.unit.uic).support_ric, "ABC")

    @override_settings(DISABLE_TRANSACTION_ATOMIC_BLOCKS=True)
    def test_purchase_order_translation(self):
        request = self.factory.get("/some-path/")
        response = transform_purchase_order(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 3 of 3 records, 0 skipped, 0 failed.")
        # Test to make sure two records exist
        self.assertEqual(PurchaseOrder.objects.all().count(), 3)
        # Make sure the existing item was updated
        self.assertEqual(PurchaseOrder.objects.get(work_order_number__order_number="WON123").dollars_withdrawn, 123.456)

    @override_settings(DISABLE_TRANSACTION_ATOMIC_BLOCKS=True)
    def test_work_order_translation(self):
        request = self.factory.get("/some-path/")
        response = transform_work_orders(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 6 of 9 records")
        self.assertEqual(WorkOrder.objects.all().count(), 7)
        # Test to make sure two records exist
        self.assertEqual(AircraftWorkOrder.objects.all().count(), 2)
        self.assertEqual(UAVWorkOrder.objects.all().count(), 2)
        self.assertEqual(AGSEWorkOrder.objects.all().count(), 2)
        # Make sure the new item was created
        self.assertEqual(AircraftWorkOrder.objects.filter(order_number="ACWO456").count(), 1)
        self.assertEqual(UAVWorkOrder.objects.filter(order_number="UAV9999").count(), 1)
        self.assertEqual(AGSEWorkOrder.objects.filter(order_number="AGSE9999").count(), 1)
        # Make sure the existing item was updated
        self.assertEqual(AircraftWorkOrder.objects.get(order_number="ACWO123").changed_by, "John Doe")
        self.assertEqual(UAVWorkOrder.objects.get(order_number="UAV01234").changed_by, "Someone")
        self.assertEqual(AGSEWorkOrder.objects.get(order_number="AGSE123").changed_by, "Noone")
