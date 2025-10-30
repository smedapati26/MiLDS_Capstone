from django.utils import timezone

from aircraft.models import Aircraft, PartLongevity, RAWPartLongevity, ShortLife
from auto_dsr.models import Unit
from utils.transform.transform_utility import copy_from_raw


def transform_longevity():
    """
    Transforms Vantage part longevity into clean tables

    @params request: (django.http.HttpRequest) the request object
    """
    mappings = [
        {
            "aircraft_serial": "aircraft.Aircraft.serial:aircraft",
            "x_uic": "auto_dsr.Unit.uic:responsible_uic",
            "last_known_uic": "auto_dsr.Unit.uic:last_known_uic",
            "uic": "auto_dsr.Unit.uic:uic",
        }
    ]
    unique_fields = ["x_2410_id"]
    filters = {"aircraft_serial__in": Aircraft.objects.all().values_list("serial", flat=True)}
    excludes = ["x_aircraft_model"]
    return copy_from_raw(
        RAWPartLongevity,
        PartLongevity,
        mapping=mappings,
        unique_fields=unique_fields,
        source_filters=filters,
        exclude=excludes,
        sync_timestamp=True,
        sync_datetime=timezone.now(),
    )
