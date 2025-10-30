from personnel.models import MOSCode


def create_test_mos_code(
    mos: str = "15T",
    mos_description: str = "UH-60 Utility Helicopter Repairer",
    amtp_mos: bool = True,
    ictl_mos: bool = True,
) -> MOSCode:
    mos = MOSCode.objects.create(mos=mos, mos_description=mos_description, amtp_mos=amtp_mos, ictl_mos=ictl_mos)

    return mos
