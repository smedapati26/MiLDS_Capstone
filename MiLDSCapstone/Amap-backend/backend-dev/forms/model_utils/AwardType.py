from django.db import models
from django.utils.translation import gettext_lazy as _


class AwardType(models.TextChoices):
    """
    Defines the kind of Awards a soldier can recieve
    """

    ASA = "ASA", _("Aviation Safety Award")
    AAM = "AAM", _("Army Achievement Medal")
    ARCOM = "ARCOM", _("Army Commendation Medal")
    GCM = "GCM", _("Good Conduct Medal")
    DSC = "DSC", _("Distinguished Service Cross")
    DDSM = "DDSM", _("Defense Distinguished Service Medal")
    DSM = "DSM", _("Distinguished Service Medal")
    SSTAR = (
        "SSTAR",
        _("Silver Star"),
    )
    DSSM = "DSSM", _("Defense Superior Service Medal")
    LOM = "LOM", _("Legion of Merit")
    DFC = "DFC", _("Distinguished Flying Cross")
    SM = "SM", _("Soldier's Medal")
    BSM = "BSM", _("Bronze Star Medal")
    PH = "PH", _("Purple Heart")
    DMSM = "DMSM", _("Defense Meritorious Service Medal")
    MSM = "MSM", _("Meritorious Service Medal")
    AM = "AM", _("Air Medal")
    JSCM = "JSCM", _("Joint Service Commendation Medal")
    JSAM = "JSAM", _("Joint Service Achievement Medal")
    POWM = "POWM", _("Prisoner of War Medal")
    ARCAM = "ARCAM", _("Army Reserve Component Achievement Medal")
    AOM = "AOM", _("Army of Occupation Medal")
    NDSM = "NDSM", _("National Defense Service Medal")
    AFEM = "AFEM", _("Armed Forces Expeditionary Medal")
    ASR = "ASR", _("Army Service Ribbon")
    AFSM = "AFSM", _("Armed Forces Service Medal")
    AOSR = "AOSR", _("Army Overseas Service Ribbon")
    AFRM = "AFRM", _("Armed Forces Reserve Medal")
    NPDR = "NPDR", _("NCO Professional Development Ribbon")
    NM = "NM", _("Nato Medal")
    UNM = "UNM", _("United Nations Medal")
    ARCOTR = "ARCOTR", _("Army Reserve Component Overseas Training Ribbon")
    Other = "Other", _("Other Award")
