from datetime import date
from typing import List, Optional

from ninja import Schema

from personnel.models import SoldierFlag


class SoldierFlagOut(Schema):
    id: int
    soldier_id: Optional[str] = None
    soldier_name: Optional[str] = None
    unit_uic: Optional[str] = None
    unit_name: Optional[str] = None
    flag_type: str
    flag_info: str
    mx_availability: str
    start_date: str
    end_date: Optional[str] = None
    flag_remarks: Optional[str] = None
    status: str
    created_by_id: Optional[str] = None
    created_by_name: Optional[str] = None
    last_modified_id: Optional[str] = None
    last_modified_name: Optional[str] = None


class SoldierUnitFlagOut(Schema):
    id: int
    soldier_id: Optional[str] = None
    soldier_name: Optional[str] = None
    unit_uic: Optional[str] = None
    unit_name: Optional[str] = None
    flag_type: str
    flag_info: str
    mx_availability: str
    start_date: str
    end_date: Optional[str] = None
    flag_remarks: Optional[str] = None
    status: str
    created_by_id: Optional[str] = None
    created_by_name: Optional[str] = None
    last_modified_id: Optional[str] = None
    last_modified_name: Optional[str] = None
    unit_soldier_count: int = 0


class SoldierPersonnelFlagOut(Schema):
    user_id: str
    primary_mos__mos: str
    rank: str
    first_name: str
    last_name: str
    unit__short_name: str
    flag_id: int


class FullSoldierFlagOut(Schema):
    individual_flags: List[SoldierFlagOut] = []
    unit_flags: List[SoldierUnitFlagOut] = []
    unit_flag_personnel: List[SoldierPersonnelFlagOut] = []


class SoldierFlagIn(Schema):
    soldier_id: Optional[str] = None
    unit_uic: Optional[str] = None
    flag_type: str
    admin_flag_info: Optional[str] = None
    unit_position_flag_info: Optional[str] = None
    tasking_flag_info: Optional[str] = None
    profile_flag_info: Optional[str] = None
    mx_availability: str
    start_date: date
    end_date: Optional[date] = None
    flag_remarks: Optional[str] = None


class SoldierFlagUpdateIn(Schema):
    flag_type: Optional[str] = None
    admin_flag_info: Optional[str] = None
    unit_position_flag_info: Optional[str] = None
    tasking_flag_info: Optional[str] = None
    profile_flag_info: Optional[str] = None
    mx_availability: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    flag_remarks: Optional[str] = None
