from supply.models import PurchaseOrder, RawPurchaseOrder
from utils.data import JULY_FOURTH_1776
from utils.transform import copy_from_raw


def transform_purchase_order():
    """
    Transforms purchase order stock from their raw form in Vantage to the Griffin data model
    A unique stock:
        plant
        storage_location
        serviceable_stock (total_stock is serviceable + non_serviceable and I believe what we want to show is just what's actually available)
        material_description
        material_number (I picked this over the gcss one because it's a bit more generic/easier to trace)
        is_bench_stock
        is_shop_stock
    """
    mappings = [
        {
            "work_order_number": "supply.WorkOrder.order_number:work_order_number",
            "purchase_requisition_item_number": "supply.PurchaseOrder.requisition_item_number",
            "purchase_requisition_number": "supply.PurchaseOrder.requisition_number",
            "purchase_order_item_number": "supply.PurchaseOrder.order_item_number",
            "purchase_order_number": "supply.PurchaseOrder.order_number",
        }
    ]
    unique_fields = [
        "purchase_requisition_number",
        "purchase_requisition_item_number",
        "order_item_number",
        "purchase_order_item_number",
    ]
    new_fields = [
        {"field": "last_change_time", "value": JULY_FOURTH_1776},
        {"field": "last_update_time", "value": JULY_FOURTH_1776},
    ]
    exclude = ["id"]
    return copy_from_raw(
        RawPurchaseOrder,
        PurchaseOrder,
        mapping=mappings,
        unique_fields=unique_fields,
        new_fields=new_fields,
        exclude=exclude,
    )
