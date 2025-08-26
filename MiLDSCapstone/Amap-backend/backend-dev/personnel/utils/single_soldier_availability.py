from personnel.models import SoldierFlag, Soldier
from personnel.model_utils import MxAvailability


def get_prevailing_user_status(user_id: str, numeric=False):
    soldier = Soldier.objects.get(user_id=user_id)
    soldier_flags = SoldierFlag.objects.filter(soldier=soldier)
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
