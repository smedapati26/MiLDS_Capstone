from tasks.models import Ictl, MOS, MosIctls


def create_test_mos_ictl(
    mos: MOS,
    ictl: Ictl,
    id: int = 1,
) -> Ictl:
    mos_ictl = MosIctls.objects.create(id=id, mos=mos, ictl=ictl)

    return mos_ictl
