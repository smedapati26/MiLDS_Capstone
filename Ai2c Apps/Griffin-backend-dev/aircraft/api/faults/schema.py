from datetime import date
from typing import List

from ninja import Field, Schema

from aircraft.models import Fault


class FaultsOverTimeSchema(Schema):
    reporting_period: date
    no_status: int = 0
    cleared: int = 0
    ti_cleared: int = 0
    diagonal: int = 0
    dash: int = 0
    admin_deadline: int = 0
    deadline: int = 0
    circle_x: int = 0
    nuclear: int = 0
    chemical: int = 0
    biological: int = 0
