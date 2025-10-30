from django.db.models import Q

from personnel.model_utils import MxAvailability
from personnel.models import Soldier, SoldierFlag


def get_prevailing_user_status(soldier: Soldier, numeric=False):
    soldier_parent_units = [soldier.unit.uic] + soldier.unit.parent_uics
    soldier_flags = SoldierFlag.objects.filter(
        Q(soldier=soldier) | Q(unit__in=soldier_parent_units), flag_deleted=False
    )
    # Default status if a soldier has no flags
    status = "Available" if numeric == False else 1
    for flag in soldier_flags:
        if flag.is_active():
            if numeric == False:
                # For active flags, take the most restrictive and set as overall availability status
                if flag.mx_availability == MxAvailability.UNAVAILABLE:
                    status = "Flagged - Unavailable"
                if flag.mx_availability == MxAvailability.LIMITED:
                    if status != "Flagged - Unavailable":
                        status = "Flagged - Limited"
                if flag.mx_availability == MxAvailability.AVAILABLE:
                    if status not in ["Flagged - Unavailable", "Flagged - Limited"]:
                        status = "Flagged - Available"
            else:
                if flag.mx_availability == MxAvailability.UNAVAILABLE:
                    status = 0
    return status
