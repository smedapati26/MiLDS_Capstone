from personnel.models import Unit
from tasks.models import Ictl
import datetime


def create_test_ictl(
    ictl_id: int = 1,
    ictl_title: str = "Test ICTL",
    date_published: datetime = datetime.date(2023, 12, 25),
    proponent: str = "USAACE",
    unit: Unit = None,
    status: str = "Approved",
    skill_level: str = "SL1",
    target_audience: str = "SL1 Soldier in TEST000AA",
) -> Ictl:
    ictl = Ictl.objects.create(
        ictl_id=ictl_id,
        ictl_title=ictl_title,
        date_published=date_published,
        proponent=proponent,
        unit=unit,
        status=status,
        skill_level=skill_level,
        target_audience=target_audience,
    )

    return ictl
