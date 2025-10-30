from django.db.models import Max
from django.utils import timezone

from aircraft.models import RAWStock, Stock
from auto_dsr.models import RawSyncTimestamp
from utils.transform.transform_utility import copy_from_raw


def transform_stock():
    """
    Transforms Vantage stock into clean tables

    @params request: (django.http.HttpRequest) the request object
    """
    mappings = [
        {
            "uic": "auto_dsr.Unit.uic:uic",
            "sloc_description_uic": "auto_dsr.Unit.uic:sloc_description_uic",
        }
    ]
    unique_fields = ["stock_id"]
    filters = (
        {
            "centaur_sync_timestamp__gte": RawSyncTimestamp.objects.filter(table="raw_stock").aggregate(
                Max("most_recent_sync")
            )["most_recent_sync__max"]
        }
        if RawSyncTimestamp.objects.filter(table="raw_stock").count() > 0
        else {}
    )
    return copy_from_raw(
        RAWStock,
        Stock,
        mapping=mappings,
        unique_fields=unique_fields,
        source_filters=filters,
        sync_timestamp=True,
        sync_datetime=timezone.now(),
    )
