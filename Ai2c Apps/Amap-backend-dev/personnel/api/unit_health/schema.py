from datetime import date
from typing import List, Optional, Union

from ninja import Field, Schema


class UnitAvailabilitySummary(Schema):
    unit_name: str
    unit_uic: str
    available_count: int
    limited_count: int
    unavailable_count: int


class UnitEvaluationSummary(Schema):
    unit_name: str
    unit_uic: str
    met_count: int
    due_count: int
    overdue_count: int


class MosBreakdown(Schema):
    mos: str
    ml0: int
    ml1: int
    ml2: int
    ml3: int
    ml4: int


class UnitMosBreakdownSummary(Schema):
    unit_name: str
    unit_uic: str
    mos_list: List[MosBreakdown]


class UnitHealthSummaryOut(Schema):
    unit_echelon: str
    units_availability: List[UnitAvailabilitySummary]
    units_evals: List[UnitEvaluationSummary]
    units_mos_breakdowns: List[UnitMosBreakdownSummary]


class SoldierEvaluationDetail(Schema):
    name: str
    user_id: str
    evaluation_status: str
    unit: str
    mos: str
    ml: str


class AvailabilityFlagDetails(Schema):
    status: str
    flag_info: Optional[str]
    remarks: Optional[str]
    start_date: str
    end_date: Optional[str]
    flag_type: Optional[str]
    recorded_by: Optional[str]
    updated_by: Optional[str]
    unit: Optional[str]


class SoldierAvailabilityDetail(Schema):
    name: str
    user_id: str
    email: str
    availability: str
    unit: str
    mos: str
    ml: str
    flag_details: Optional[AvailabilityFlagDetails]


class SoldierAvailabilityByUnitDetail(Schema):
    unit_name: str
    soldiers: List[SoldierAvailabilityDetail]


class SoldierMissingPacketsDetail(Schema):
    name: str
    user_id: str
    packet_status: str
    arrival_at_unit: Optional[date] = None
    unit: str


class EventTask(Schema):
    number: str
    name: Optional[str]
    go_nogo: Optional[str] = None


class EvaluationEvent(Schema):
    id: Optional[int] = None
    eval_date: Optional[str] = None
    go_nogo: Optional[str] = None
    total_mx_hours: Optional[float] = None
    comment: str = ""
    event_type: Optional[str] = None
    evaluation_type: Optional[str] = None
    maintenance_level: Optional[str] = None
    mos: Optional[str] = Field(None, alias="mos__mos")
    event_tasks: Optional[List[EventTask]] = None

    class Config:
        populate_by_name = True


class SoldierHealth(Schema):
    rank: str
    name: str
    user_id: str
    email: str
    availability: str
    unit: str
    mos: str
    ml: str
    birth_month: str
    last_evaluation_date: str
    last_evaluation_data: Optional[EvaluationEvent]
    evaluation_status: str
    flag_availability_data: Optional[AvailabilityFlagDetails]


class UnitHealthRosterOut(Schema):
    soliders: List[SoldierHealth]


class EventDate(Schema):
    id: int
    eval_date: Optional[date] = None
    go_nogo: Optional[str] = None


class EvaluationColumn(Schema):
    eval_name: str
    eval_details: EventDate


class EvalTraining(Schema):
    name: str
    mos: str
    unit: str
    birth_month: str
    evaluations: List[EvaluationColumn]


class TaskSchema(Schema):
    task_name: str
    familiarized_gonogo: bool
    familiarized_date: str
    trained_gonogo: bool
    trained_date: str
    evaluated_gonogo: bool
    evaluated_date: str


class CriticalTaskList(Schema):
    name: str
    tasks: List[TaskSchema]


class TaskSoldier(Schema):
    rank: str
    first_name: str
    last_name: str
    primary_mos: str
    birth_month: str
    unit: str
    ctls: List[CriticalTaskList]


class TrainingAndEvalsOut(Schema):
    events: List[EvalTraining]
    task_numbers: List[TaskSoldier]


class MOSMLReportData(Schema):
    mos: str
    ml0: int
    ml1: int
    ml2: int
    ml3: int
    ml4: int
    missing_packets: int
    total: int
    available: int


class MOSMLUnitReportData(Schema):
    report_data: Optional[List[MOSMLReportData]] = None
    unit_uic: str
    unit_name: str


class MOSMLReportOut(Schema):
    primary_unit: MOSMLUnitReportData
    subordinate_units: List[MOSMLUnitReportData]


class EventReportFilters(Schema):
    unit_uic: str
    birth_months: List[str]
    start_date: str
    end_date: str
    completion_types: List[str]
    evaluation_types: List[str]
    training_types: List[str]


class EventReportEventData(Schema):
    id: int
    event_type: str
    type: str
    date: str
    result: str
    occurences: Optional[List[str]] = None


class EventReportSoldierOut(Schema):
    soldier_id: str
    soldier_name: str
    mos: Optional[str] = None
    unit: str
    birth_month: str
    events: List[EventReportEventData]


class TaskReportFilters(Schema):
    birth_months: List[str]
    start_date: str
    end_date: str
    uctl_ids: List[str]
    task_numbers: List[str]


class TaskReportTaskData(Schema):
    task_number: str
    task_name: str
    familiarized_date: Optional[str]
    familiarized_go_no_go: Optional[str]
    trained_date: Optional[str]
    trained_go_no_go: Optional[str]
    evaluated_date: Optional[str]
    evaluated_go_no_go: Optional[str]


class TaskReportListData(Schema):
    ctl_name: str
    tasks: Optional[List[TaskReportTaskData]]


class TaskReportSoldierOut(Schema):
    soldier_id: str
    soldier_name: str
    mos: Optional[str] = None
    unit: str
    birth_month: str
    tasks_list: List[TaskReportListData]
    individual_tasks_list: List[TaskReportTaskData]
