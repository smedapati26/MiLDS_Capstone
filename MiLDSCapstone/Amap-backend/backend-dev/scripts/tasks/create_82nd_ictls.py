from tasks.models import Ictl, MOS, MosIctls
from personnel.models import Unit


def create_82nd_ictls():
    # Already created 15T and 15B by hand
    mos_to_create = ["15D", "15G", "15H", "15N", "15F", "15U", "15Y", "15R", "15M", "15E"]
    unit = Unit.objects.get(uic="WCEZFF")
    for mos in mos_to_create:
        for sl in range(1, 5):
            ictl = Ictl.objects.create(
                ictl_title="82nd CAB {} ICTL (SL{})".format(mos, sl),
                proponent="Unit",
                unit=unit,
                status="Approved",
                skill_level="SL{}".format(sl),
                target_audience="{} Skill Level {} Maintainers in the 82nd CAB".format(mos, sl),
            )
            ictl.save()
            mos_obj = MOS.objects.get(mos_code=mos)
            mos_ictl = MosIctls.objects.create(mos=mos_obj, ictl=ictl)
            mos_ictl.save()
