from django.utils import timezone

from aircraft.models import LCF_341_01_LifeLimit, RAWLCF_341_01_LifeLimit
from utils.transform.transform_utility import copy_from_raw


def transform_part_life_limit():
    """
    Transforms Vantage part life limit into clean tables
    """
    unique_fields = ["model_name", "part_number", "cage", "component_type"]
    excludes = [
        "id",
        "remark",
        "form16",
        "nha16",
        "tc_16",
        "cc_16",
        "form16_1",
        "nha16_1",
        "form16_2",
        "nha16_2",
        "da2408_16",
        "da2408_16_1",
        "da2408_16_2",
        "da2408_33",
        "da2410",
        "da2408_xx",
        "da2408_20",
        "da2408_4_1",
        "da2408_19",
        "da2408_19_1",
        "da2408_19_2",
        "da2408_19_3",
        "da2408_19_X",
        "daactuateddevice",
    ]
    return copy_from_raw(
        RAWLCF_341_01_LifeLimit,
        LCF_341_01_LifeLimit,
        unique_fields=unique_fields,
        exclude=excludes,
        sync_timestamp=True,
        sync_datetime=timezone.now(),
    )
