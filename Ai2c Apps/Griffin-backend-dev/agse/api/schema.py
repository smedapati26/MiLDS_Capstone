from datetime import date
from typing import List, Optional

from ninja import Schema


class AGSEEquipOut(Schema):
    equipment_number: str
    lin: str
    serial_number: str
    condition: str
    current_unit: Optional[str]
    nomenclature: str
    display_name: str
    earliest_nmc_start: Optional[date]
    model: Optional[str]
    days_nmc: Optional[int]
    remarks: Optional[str]


class AGSESyncOut(Schema):
    equipment_number: str
    sync_condition: Optional[bool]
    sync_remarks: Optional[bool]
    sync_earliest_nmc_start: Optional[bool]


class AGSEOut(Schema):
    agse: List[AGSEEquipOut]
    syncs: List[AGSESyncOut]


class AGSESubordinateOut(Schema):
    subordinate: str
    display_name: str
    agse: List[AGSEEquipOut]


class AGSEErrorOut(Schema):
    detail: str


class AGSEConditionAggregateOut(Schema):
    display_name: str
    fmc: int
    pmc: int
    nmc: int


class AddAGSE(Schema):
    task_force: str
    agse_equipment_numbers: List[str]


class RemoveAGSE(Schema):
    task_force: str
    agse_equipment_numbers: List[str]


class ErrorResponse(Schema):
    detail: str


class EditAGSE(Schema):
    status: str
    earliest_nmc_start: date | None = None
    remarks: str | None = None
    lock_type: str | None = None
    sync_condition: bool | None = None
    sync_earliest_nmc_start: bool | None = None
    sync_remarks: bool | None = None
