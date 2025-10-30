from datetime import date, datetime
from enum import Enum
from typing import List, Optional, Union

from ninja import FilterSchema, ModelSchema, Schema
from pydantic import Field

from personnel.model_utils import MaintenanceLevel, Rank
from personnel.models import MOSCode

MaintenanceLevelEnum = Enum(
    "MaintenanceLevelEnum", {choice[0]: choice[0] for choice in MaintenanceLevel.choices}, type=str
)


class UnavailableMaintainersOut(Schema):
    mos: str
    ml: str
    count: int


class InexperiencedMaintainersOut(Schema):
    mos: str
    ml: str
    count: int


class PhaseMaintainersOut(Schema):
    user_id: str
    first_name: str
    last_name: str
    ml: str
    mos: str
    availability_flag: bool


class MOSAvailabilityOut(Schema):
    mos: str
    available_count: int
    total_count: int
    authorized_count: int


class RankFilter(FilterSchema):
    ranks: List[str] = Field(default=Rank.values)


class MOSFilter(FilterSchema):
    MOSs: List[str] = Field(default=[])


class MaintenanceLevelCount(Schema):
    level: MaintenanceLevelEnum
    count: int


class DateData(Schema):
    date: str
    counts: List[MaintenanceLevelCount]


class MOSData(Schema):
    mos: str
    authorized_personnel: int
    data: List[DateData]


class MOSCodeOut(ModelSchema):
    class Meta:
        model = MOSCode
        fields = ["mos"]


class CTLTask(Schema):
    task_number: str
    task_title: str
    frequency: str
    subject_area: str
    ictl_proponent: Optional[str]
    skill_level: str
    mos: str
    last_trained_date: Optional[str]
    last_trained_id: Optional[int]
    last_evaluated_date: Optional[str]
    last_evaluated_id: Optional[int]
    next_due: Optional[int]
    document_link: Optional[str]


class CTLResponse(Schema):
    soldier_ictl: List[dict]
    soldier_uctl: List[dict]


class EventTaskData(Schema):
    id: int
    soldier_id: str
    date: date
    uic_id: str
    event_type__type: Optional[str]
    training_type__type: Optional[str]
    evaluation_type__type: Optional[str]
    go_nogo: Optional[str]
    gaining_unit_id: Optional[str]
    tcs_location__abbreviation: Optional[str]
    award_type__type: Optional[str]
    total_mx_hours: Optional[float]
    comment: str
    maintenance_level: Optional[str]
    recorded_by_legacy: Optional[str]
    recorded_by_id: Optional[str]
    recorded_by_non_legacy: Optional[str]
    attached_da_4856_id: Optional[int]
    event_deleted: bool
    mos__mos: Optional[str]
    event_tasks: List[str]
    has_associations: bool


class DA7817Response(Schema):
    da_7817s: List[EventTaskData]


class AwardTypeOut(Schema):
    Type: str
    Description: str


class EvaluationTypeOut(Schema):
    Type: str
    Description: str


class EventTypeOut(Schema):
    Type: str
    Description: str


class TCSLocationOut(Schema):
    abbreviation: str
    location: str


class TrainingTypeOut(Schema):
    Type: str
    Description: str


class MOSCodeOut(Schema):
    mos: str
    mos_description: str


class UpdateSoldierIn(Schema):
    primary_mos: Optional[str] = "not_passed"
    additional_mos: Optional[Union[str, List[str]]] = "not_passed"
    birth_month: Optional[str] = "not_passed"
    pv2_dor: Optional[str] = "not_passed"
    pfc_dor: Optional[str] = "not_passed"
    spc_dor: Optional[str] = "not_passed"
    sgt_dor: Optional[str] = "not_passed"
    ssg_dor: Optional[str] = "not_passed"
    sfc_dor: Optional[str] = "not_passed"
    dod_email: Optional[str] = "not_passed"
    receive_emails: Optional[bool] = None


class UpdateSoldierOut(Schema):
    user_id: str
    rank: Optional[str]
    first_name: str
    last_name: str
    primary_mos: str
    primary_ml: Optional[str]
    all_mos_and_ml: dict
    pv2_dor: Optional[datetime]
    pfc_dor: Optional[datetime]
    spc_dor: Optional[datetime]
    sgt_dor: Optional[datetime]
    ssg_dor: Optional[datetime]
    sfc_dor: Optional[datetime]
    unit: str
    is_admin: bool
    is_maintainer: bool
    dod_email: Optional[str]
    birth_month: str


class PhaseTeamIn(Schema):
    phase_lead_user_id: str
    assistant_phase_lead_user_id: str
    phase_members: List[str] = []


class PhaseTeamOut(Schema):
    id: int
    phase_id: int
    phase_members: list[str]
    phase_lead_user_id: str
    assistant_phase_lead_user_id: str


class CrewAuthorizedActualDelta(Schema):
    mos: str
    authorized_count: int
    actual_count: int
    prior_period_actual_count: int


class MaintainersAuthorizedActualDelta(Schema):
    authorized_total: int
    actual_total: int
    prior_period_actual_count: int


class ActualAuthorizedByMosOut(Schema):
    maintainer_counts: MaintainersAuthorizedActualDelta
    crew_counts: List[CrewAuthorizedActualDelta]


class SkillAvailabilityOut(Schema):
    skill: str
    available_count: int
    total_count: int
    authorized_count: int
