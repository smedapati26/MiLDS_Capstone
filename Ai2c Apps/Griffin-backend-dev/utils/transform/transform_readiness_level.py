from personnel.models import RAWReadinessLevel, ReadinessLevel
from utils.transform import copy_from_raw


def transform_readiness_level():
    """
    Transforms RAW Readiness Level Table to Clean Table
    """
    mappings = [{"acft_mds": "aircraft.Airframe.mds:airframe", "dodid": "personnel.Soldier.dodid:dodid"}]
    unique_fields = ["dodid", "acft_mds", "rl_type"]
    excludes = ["id"]
    return copy_from_raw(
        RAWReadinessLevel, ReadinessLevel, mapping=mappings, unique_fields=unique_fields, exclude=excludes
    )
