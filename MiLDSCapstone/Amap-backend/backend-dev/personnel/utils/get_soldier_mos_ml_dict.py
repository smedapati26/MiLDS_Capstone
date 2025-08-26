from personnel.models import Soldier, MOSCode
from forms.models import DA_7817

## For demo
import random


def get_soldier_mos_ml(soldier: Soldier, all=False):
    # TODO - Once DA7817s has MOS as a field, this will also filter on that for primary as well as
    # Additional MOS
    mos_ml_dict = {}
    primary_ml = None

    # Get most recent non-deleted primary mos event, set primary ml
    most_recent_primary_mos_event = (
        DA_7817.objects.filter(soldier=soldier, event_deleted=False, mos=soldier.primary_mos)
        .order_by("-date", "-maintenance_level")
        .first()
    )
    if most_recent_primary_mos_event:
        primary_ml = most_recent_primary_mos_event.maintenance_level

    if all:
        # Set primary mos in returned dict if soldier has ml, otherwise return empty dict
        if not soldier.primary_mos:
            return mos_ml_dict
        mos_ml_dict[soldier.primary_mos.mos] = primary_ml
        for mos in soldier.additional_mos.all():
            # Default ML to None
            mos_ml = None
            # Get most recent non-deleted mos event, set ml for mos
            # TODO - filter event on MOSCode
            most_recent_mos_event = (
                DA_7817.objects.filter(soldier=soldier, event_deleted=False, mos=mos)
                .order_by("-date", "-maintenance_level")
                .first()
            )
            if most_recent_mos_event:
                mos_ml = most_recent_mos_event.maintenance_level

            mos_ml_dict[mos.mos] = mos_ml

        return mos_ml_dict

    else:
        return primary_ml
