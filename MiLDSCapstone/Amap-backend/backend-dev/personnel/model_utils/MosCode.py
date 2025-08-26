from django.db import models
from django.utils.translation import gettext_lazy as _


class MosCode(models.TextChoices):
    """
    Defines a soldier's MOS
    """

    B = "15B", _("Aircraft Power Plant Repairer")
    D = "15D", _("Aircraft Powertrain Repairer")
    E = "15E", _("RQ-7 Unmanned Aircraft Systems Repairer")
    F = "15F", _("Aircraft Electrician")
    G = "15G", _("Aircraft Structural Repairer")
    H = "15H", _("Aircraft Pneudraulics Repairer")
    M = "15M", _("MQ-1 unmanned Aircraft Systems Repairer")
    N = "15N", _("Avionic Mechanic")
    R = "15R", _("AH-64 Attach Helicopter Repairer")
    T = "15T", _("UH-60 Utility Helicopter Repairer")
    U = "15U", _("CH-47 Cargo Helicopter Repairer")
    Y = "15Y", _("AH-64 Armament/Electrical/Avionic Systems Repairer")
    K = "15K", _("Aircraft Components Repair Supervisor")
    L = "15L", _("Armament/Electrical/Avionic Repair Supervisor")
    Z = "15Z", _("Aviation Senior Sergeant")
    R94 = "94R", _("Avionics and Survivability Equipment Repairer")
    E94 = "94E", _("Radio Equipment Repairer")
    B3 = "B3", _("UH-72A Lakota Utility Helicopter Repairer")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in MOS Codes"

        return valid_value
