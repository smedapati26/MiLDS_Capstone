from supply.models import ProvisionalStock, RawProvisionalStock
from utils.transform import copy_from_raw


def transform_provisional_stock():
    """
    Transforms provisional stock from their raw form in Vantage to the Centaur data model
    A unique stock:
        plant
        storage_location
        serviceable_stock (total_stock is serviceable + non_serviceable and I believe what we want to show is just what's actually available)
        material_description
        material_number (I picked this over the gcss one because it's a bit more generic/easier to trace)
        is_bench_stock
        is_shop_stock
    """
    mappings = [{"uic": "auto_dsr.Unit.uic"}, {"sloc_description_uic": "auto_dsr.Unit.uic:sloc_description_uic"}]
    unique_fields = [
        "plant",
        "storage_location",
        "serviceable_stock",
        "material_description",
        "material_number",
        "is_bench_stock",
        "is_shop_stock",
        "uic",
    ]
    return copy_from_raw(RawProvisionalStock, ProvisionalStock, mapping=mappings, unique_fields=unique_fields)
