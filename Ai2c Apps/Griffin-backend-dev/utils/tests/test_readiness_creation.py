from datetime import datetime

from django.utils import timezone

from aircraft.models import Airframe
from personnel.models import RAWReadinessLevel, ReadinessLevel, Soldier


def test_create_readiness_level(
    airframe: Airframe,
    dodid: Soldier,
    rl_type: str = "NVG",
    readiness_level: str = "1",
    instructor_dodid: str = "9998887777",
    rl_start_date: datetime = timezone.now(),
    rl_end_date: datetime = timezone.now(),
):
    return ReadinessLevel.objects.create(
        dodid=dodid,
        airframe=airframe,
        rl_type=rl_type,
        readiness_level=readiness_level,
        instructor_dodid=instructor_dodid,
        rl_start_date=rl_start_date,
        rl_end_date=rl_end_date,
    )


def test_create_raw_readiness_level(
    airframe: str = "AH-640",
    dodid: str = "1112223333",
    rl_type: str = "NVG",
    readiness_level: str = "1",
    instructor_dodid: str = "9998887777",
    rl_start_date: datetime = timezone.now(),
    rl_end_date: datetime = timezone.now(),
):
    return RAWReadinessLevel.objects.create(
        dodid=dodid,
        acft_mds=airframe,
        rl_type=rl_type,
        readiness_level=readiness_level,
        instructor_dodid=instructor_dodid,
        rl_start_date=rl_start_date,
        rl_end_date=rl_end_date,
    )
