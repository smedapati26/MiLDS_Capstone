from personnel.models import SoldierFlag
from personnel.model_utils import MxAvailability


def get_prevailing_status(soldier_flags: list[SoldierFlag]) -> str:
    """
    Given a list of soldier flags representing all flags stored for the given Soldier, returns their
    prevailing maintenance availability status

    @param soldier_flags: (list[SoldierFlag]) a list of SoldierFlags

    @returns (str) the Soldier's current maintenance availability
    """
    # Default status if a soldier has no flags
    status = "Available"
    for flag in soldier_flags:
        if flag.is_active():
            # For active flags, take the most restrictive and set as overall availability status
            if flag.mx_availability == MxAvailability.UNAVAILABLE:
                status = "Flagged - Unavailable"
            if flag.mx_availability == MxAvailability.LIMITED:
                if status != "Flagged - Unavailable":
                    status = "Flagged - Limited"
            if flag.mx_availability == MxAvailability.AVAILABLE:
                if status not in ["Flagged - Unavailable", "Flagged - Limited"]:
                    status = "Flagged - Available"
    return status
