from datetime import date, datetime
from typing import List, Optional

from ninja import Schema


class FaultDetails(Schema):
    fault_id: str
    aircraft: Optional[str]
    unit: Optional[str]
    discoverer: Optional[str]
    discover_date: Optional[date]
    corrective_date: Optional[date]
    fault_work_unit_code: Optional[str]
    total_man_hours: float
    inspector: Optional[str]
    closer: Optional[str]
    remarks: Optional[str]


class FaultActionWithFaultDetails(Schema):
    fault_action_id: str
    role: str
    discovered_on: date
    closed_on: Optional[date]
    maintenance_action: Optional[str]
    status_code: str
    corrective_action: Optional[str]
    fault_work_unit_code: Optional[str]
    man_hours: Optional[float]
    fault_details: FaultDetails


class SoldierFaultHistoryResponse(Schema):
    fault_actions: List[FaultActionWithFaultDetails]


class FaultStatusCodeOut(Schema):
    value: str
    label: str


class FaultActionMaintainer(Schema):
    user_id: str
    name: str
    man_hours: float


class FaultActionDetail(Schema):
    fault_action_id: str
    sequence_number: int
    discovered_on: datetime
    closed_on: Optional[datetime]
    closer_name: Optional[str]
    maintenance_action: Optional[str]
    action_status: Optional[str]
    inspector_name: Optional[str]
    man_hours: float
    fault_work_unit_code: Optional[str]
    maintainers: List[FaultActionMaintainer]


class FaultDetailResponse(Schema):
    fault_id: str
    discoverer_name: Optional[str]
    aircraft: Optional[str]
    discovered_on: datetime
    corrected_on: Optional[datetime]
    unit_name: Optional[str]
    fault_work_unit_code: Optional[str]
    total_man_hours: float
    remarks: Optional[str]
    fault_actions: List[FaultActionDetail]


class SoldierFaultIdsOut(Schema):
    fault_ids: List[str]


class SoldierFaultWucsOut(Schema):
    wucs: List[str]


class FaultStatusCodeOut(Schema):
    value: str
    label: str
