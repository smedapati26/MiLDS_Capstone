from django.utils import timezone

from supply.models import PurchaseOrder, RawPurchaseOrder, WorkOrder


def create_single_test_purchase_order(
    work_order_number: WorkOrder,
    dollars_withdrawn: float = 3.14,
    item_delivered: bool = False,
    movement_type: str = "watch escapement",
    ordered_material_description: str = "Tropical Fruit",
    quantity_on_hand: float = 3.14,
    quantity_ordered: float = 3.14159,
    quantity_required: float = 3.14,
    quantity_withdrawn: float = 3.0,
    requisition_item_number: str = "ABC",
    requisition_last_changed_by_user: str = "Abe Froeman",
    requisition_material_description: str = "Delorian",
    requisition_material_number: str = "CCC333",
    requisition_number: str = "A123123",
    reservation_priority: str = "cr",
    reservation_storage_location: str = "1060 West Addison",
    reservation_urgency: str = "urgent",
    storage_location: str = "QQQQ",
    unit_of_measure: str = "banana",
    order_number: str = "ON123",
    order_item_number: str = "OIN123",
) -> PurchaseOrder:
    """
    Creates a single Purchase Order object.

    @param work_order_number:
    @param dollars_withdrawn:
    @param item_delivered:
    @param movement_type:
    @param ordered_material_description:
    @param quantity_on_hand:
    @param quantity_ordered:
    @param quantity_required:
    @param quantity_withdrawn:
    @param requisition_item_number:
    @param requisition_last_changed_by_user:
    @param requisition_material_description:
    @param requisition_material_number:
    @param requisition_number:
    @param reservation_priority:
    @param reservation_storage_location:
    @param reservation_urgency:
    @param storage_location:
    @param unit_of_measure:

    @returns (PurchaseOrder)
        The newly created PurchaseOrder object
    """
    new_purchase_order = PurchaseOrder.objects.create(
        work_order_number=work_order_number,
        dollars_withdrawn=dollars_withdrawn,
        item_delivered=item_delivered,
        movement_type=movement_type,
        ordered_material_description=ordered_material_description,
        quantity_on_hand=quantity_on_hand,
        quantity_ordered=quantity_ordered,
        quantity_required=quantity_required,
        quantity_withdrawn=quantity_withdrawn,
        requisition_item_number=requisition_item_number,
        requisition_last_changed_by_user=requisition_last_changed_by_user,
        requisition_material_description=requisition_material_description,
        requisition_material_number=requisition_material_number,
        requisition_number=requisition_number,
        reservation_priority=reservation_priority,
        reservation_storage_location=reservation_storage_location,
        reservation_urgency=reservation_urgency,
        storage_location=storage_location,
        unit_of_measure=unit_of_measure,
        last_change_time=timezone.now(),
        last_update_time=timezone.now(),
        requisition_last_changed_on_date=timezone.now(),
        required_by_date=timezone.now(),
        item_delivery_datetime="2025-01-08T00:00:00Z",
        order_number=order_number,
        order_item_number=order_item_number,
    )

    return new_purchase_order


def create_single_test_raw_purchase_order(
    work_order_number: str = "WON12345",
    dollars_withdrawn: float = 3.14,
    item_delivered: bool = False,
    movement_type: str = "watch escapement",
    ordered_material_description: str = "Tropical Fruit",
    quantity_on_hand: float = 3.14,
    quantity_ordered: float = 3.14159,
    quantity_required: float = 3.14,
    quantity_withdrawn: float = 3.0,
    requisition_item_number: str = "ABC",
    requisition_last_changed_by_user: str = "Abe Froeman",
    requisition_material_description: str = "Delorian",
    requisition_material_number: str = "CCC333",
    requisition_number: str = "A123123",
    reservation_priority: str = "cr",
    reservation_storage_location: str = "1060 West Addison",
    reservation_urgency: str = "urgent",
    storage_location: str = "QQQQ",
    unit_of_measure: str = "banana",
    order_number: str = "ON123",
    order_item_number: str = "OIN123",
) -> PurchaseOrder:
    """
    Creates a single RAW Purchase Order object.

    @param work_order_number:
    @param dollars_withdrawn:
    @param item_delivered:
    @param movement_type:
    @param ordered_material_description:
    @param quantity_on_hand:
    @param quantity_ordered:
    @param quantity_required:
    @param quantity_withdrawn:
    @param requisition_item_number:
    @param requisition_last_changed_by_user:
    @param requisition_material_description:
    @param requisition_material_number:
    @param requisition_number:
    @param reservation_priority:
    @param reservation_storage_location:
    @param reservation_urgency:
    @param storage_location:
    @param unit_of_measure:

    @returns (PurchaseOrder)
        The newly created PurchaseOrder object
    """
    new_purchase_order = RawPurchaseOrder.objects.create(
        work_order_number=work_order_number,
        dollars_withdrawn=dollars_withdrawn,
        item_delivered=item_delivered,
        movement_type=movement_type,
        ordered_material_description=ordered_material_description,
        quantity_on_hand=quantity_on_hand,
        quantity_ordered=quantity_ordered,
        quantity_required=quantity_required,
        quantity_withdrawn=quantity_withdrawn,
        purchase_requisition_item_number=requisition_item_number,
        requisition_last_changed_by_user=requisition_last_changed_by_user,
        requisition_material_description=requisition_material_description,
        requisition_material_number=requisition_material_number,
        purchase_requisition_number=requisition_number,
        reservation_priority=reservation_priority,
        reservation_storage_location=reservation_storage_location,
        reservation_urgency=reservation_urgency,
        storage_location=storage_location,
        unit_of_measure=unit_of_measure,
        centaur_sync_timestamp=timezone.now(),
        requisition_last_changed_on_date=timezone.now(),
        required_by_date=timezone.now(),
        item_delivery_datetime="2025-01-08T00:00:00Z",
        purchase_order_item_number=order_item_number,
        purchase_order_number=order_number,
    )

    return new_purchase_order
