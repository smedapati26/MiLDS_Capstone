from django.db import models
from django.utils.translation import gettext_lazy as _


class Rank(models.TextChoices):
    """
    Defines the potential ranks a user can have
    """

    PV1 = "PV1", _("Private")
    PV2 = "PV2", _("Private")
    PFC = "PFC", _("Private First Class")
    SPC = "SPC", _("Specialist")
    CPL = "CPL", _("Corporal")
    SGT = "SGT", _("Sergeant")
    SSG = "SSG", _("Staff Sergeant")
    SFC = "SFC", _("Sergeant First Class")
    MSG = "MSG", _("Master Sergeant")
    FIRST_SERGEANT = "1SG", _("First Sergeant")
    SGM = "SGM", _("Sergeant Major")
    CSM = "CSM", _("Command Sergeant Major")
    SMA = "SMA", _("Sergeant Major of the Army")
    WO1 = "WO1", _("Warrant Officer 1")
    CW2 = "CW2", _("Chief Warrant Officer 2")
    CW3 = "CW3", _("Chief Warrant Officer 3")
    CW4 = "CW4", _("Chief Warrant Officer 4")
    CW5 = "CW5", _("Chief Warrant Officer 5")
    SECOND_LIEUTENANT = "2LT", _("Second Lieutenant")
    FIRST_LIEUTENANT = "1LT", _("First Lieutenant")
    CPT = "CPT", _("Captain")
    MAJ = "MAJ", _("Major")
    LTC = "LTC", _("Lieutenant Colonel")
    COL = "COL", _("Colonel")
    BG = "BG", _("Brigadier General")
    MG = "MG", _("Major General")
    LTG = "LTG", _("Lieutenant General")
    GEN = "GEN", _("General")
    GA = "GA", _("General of the Army")
    CTR = "CTR", _("Contractor")
    GS1 = "GS1", _("GS-1")
    GS2 = "GS2", _("GS-2")
    GS3 = "GS3", _("GS-3")
    GS4 = "GS4", _("GS-4")
    GS5 = "GS5", _("GS-5")
    GS6 = "GS6", _("GS-6")
    GS7 = "GS7", _("GS-7")
    GS8 = "GS8", _("GS-8")
    GS9 = "GS9", _("GS-9")
    GS10 = "GS10", _("GS-10")
    GS11 = "GS11", _("GS-11")
    GS12 = "GS12", _("GS-12")
    GS13 = "GS13", _("GS-13")
    GS14 = "GS14", _("GS-14")
    GS15 = "GS15", _("GS-15")
    SES1 = "SES1", _("SES-1")
    SES2 = "SES2", _("SES-2")
    SES3 = "SES3", _("SES-3")
    SES4 = "SES4", _("SES-4")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls._value2member_map_
        if not valid_value and return_error:
            return f"{value} not found in Ranks"

        return valid_value
