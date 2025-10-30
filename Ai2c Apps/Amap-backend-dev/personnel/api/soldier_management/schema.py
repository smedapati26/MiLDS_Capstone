from typing import List, Optional, Union

from ninja import Schema


class UnitFlagOut(Schema):
    flag_id: int
    unit: str
    unit_uic: str
    flag_type: str
    flag_info: Optional[str]
    mx_availability: str
    maintainer_count: int
    start_date: str
    end_date: Optional[str]
    remarks: Optional[str]


class RoleAssignment(Schema):
    unit_uic: str
    role: str


class CreateSoldierIn(Schema):
    dod_id: str
    first_name: str
    last_name: str
    rank: str
    unit_uic: str
    is_maintainer: Optional[bool] = True
    is_admin: Optional[bool] = False
    roles: Optional[List[RoleAssignment]] = None


class SoldierActiveFlagOut(Schema):
    flag_id: int
    flag_type: str
    flag_info: Optional[str]
    mx_availability: str
    start_date: str
    end_date: Optional[str]
    remarks: Optional[str]


class SoldierFlagDetail(Schema):
    name: str
    rank: str
    dod_id: str
    mx_availability: str
    unit: str
    last_active: str
    roles: List[str]
    designations: Optional[str]


class UnitSoldierFlagsOut(Schema):
    unit_mx_availability: str
    soldier_flags: List[SoldierFlagDetail]


class UnitRoleDesignationOut(Schema):
    unit_name: str
    unit_uic: str
    role_id: Optional[int]
    role_type: Optional[str]
    designation_id: Optional[int]
    designation_type: Optional[str]


class SoldierInfoOut(Schema):
    name: str
    rank: str
    dod_id: str
    current_unit: str
    primary_mos: str
    additional_mos: List[str]
    unit_roles_and_designations: List[UnitRoleDesignationOut]
    unit_name: str


class CreateUserRoleIn(Schema):
    soldier_id: Union[str, int]
    unit_uic: str
    role: str


class UpdateUserRoleIn(Schema):
    role: Optional[str] = None
    designation: Optional[str] = None
