from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from ninja import FilterSchema, ModelSchema, Schema
from pydantic import Field

from personnel.model_utils import MaintenanceLevel, Rank
from personnel.models import MOSCode, Soldier


class VantageUnitOut(Schema):
    uic: str
    short_name: str
    display_name: str
    nick_name: Optional[str]
    echelon: str
    compo: str
    state: Optional[str]
    parent_unit: Optional[str]
    parent_uics: List[str] = []
    child_uics: List[str] = []
    subordinate_uics: List[str] = []
    last_sync: datetime


class VantageMaintainerOut(Schema):
    dodid: str
    uic: str
    mos: str
    availability_status: str
    maintenance_level: Optional[str]
    last_sync: datetime
