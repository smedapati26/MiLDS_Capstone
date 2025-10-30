from tasks.models import MOS


def create_test_mos(mos_code: str = "15T") -> MOS:
    mos = MOS.objects.create(mos_code=mos_code)

    return mos
