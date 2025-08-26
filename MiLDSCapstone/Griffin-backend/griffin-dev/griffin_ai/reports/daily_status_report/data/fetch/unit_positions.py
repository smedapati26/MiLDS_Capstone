from auto_dsr.models import Unit, UserPosition
from auto_dsr.model_utils import UnitEchelon


def unit_position_data_for(unit: Unit) -> tuple[str, str, str]:
    """
    Fetches unit POCs to render on reports pages

    @param unit: (auto_dsr.models.Unit) the unit to fetch the POCs for
    @returns tuple(str,str,str) The CDR, OIC and NCOIC for the given unit
    """

    if unit.echelon == UnitEchelon.BRIGADE:
        oic = UserPosition.objects.filter(unit=unit, position__abbreviation="BAMO OIC").select_related("user").first()
        ncoic = (
            UserPosition.objects.filter(unit=unit, position__abbreviation="BAMO NCOIC").select_related("user").first()
        )
        cdr = UserPosition.objects.filter(unit=unit, position__abbreviation="CDR").select_related("user").first()
    else:
        oic = UserPosition.objects.filter(unit=unit, position__abbreviation="PC OIC").select_related("user").first()
        ncoic = UserPosition.objects.filter(unit=unit, position__abbreviation="PC NCOIC").select_related("user").first()
        cdr = UserPosition.objects.filter(unit=unit, position__abbreviation="CDR").select_related("user").first()

    if oic:
        oic_string = oic.user.name_and_rank()
    else:
        oic_string = None

    if ncoic:
        ncoic_string = ncoic.user.name_and_rank()
    else:
        ncoic_string = None
    if cdr:
        cdr_string = cdr.user.name_and_rank()
    else:
        cdr_string = None

    return cdr_string, oic_string, ncoic_string
