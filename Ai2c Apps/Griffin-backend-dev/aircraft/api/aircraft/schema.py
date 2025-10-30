from datetime import datetime
from typing import List, Literal, Optional

from ninja import Field, FilterSchema, ModelSchema, Schema
from pydantic import ConfigDict

from aircraft.models import Aircraft, ShortLife, SurvivalPredictions
from auto_dsr.api.schema import LocationOut


class AircraftOut(ModelSchema):
    aircraft_model: str = Field("", alias="airframe.model")
    aircraft_mds: str = Field("", alias="airframe.mds")
    aircraft_family: str = Field("", alias="airframe.family")

    class Meta:
        model = Aircraft
        fields = ["serial"]


class ShortLifeOut(ModelSchema):
    aircraft_model: str = Field("", alias="aircraft.airframe.model")

    class Meta:
        model = ShortLife
        fields = [
            "id",
            "aircraft",
            "work_unit_code",
            "nomenclature",
            "part_number",
            "comp_serial_number",
            "tracker_display_name",
            "component_type",
            "current_value",
            "replacement_due",
            "flying_hours_remaining",
        ]


class AircraftInfo(ModelSchema):
    class Meta:
        model = Aircraft
        fields = [
            "date_down",
            "hours_to_phase",
            "in_phase",
            "last_update_time",
            "phase_start_date",
            "remarks",
            "serial",
            "total_airframe_hours",
        ]


class InspectionInfo(Schema):
    inspection__id: int
    inspection__hours_interval: Optional[int] = None
    inspection__inspection_name: Optional[str] = None
    inspection__last_conducted_hours: Optional[float] = None
    inspection__next_due_hours: Optional[float] = None
    till_due: Optional[float] = None
    serial: str


class AircraftDSROut(Schema):
    aircraft: List[AircraftInfo]
    inspection: List[InspectionInfo]


class AircraftDSRFilterSchema(FilterSchema):
    uic: Optional[str] = Field(None, q="uic")
    serials: Optional[List[str]] = Field(None, q="serials")


class SurvivalPredictionsOut(ModelSchema):
    aircraft_model: str = Field("", alias="aircraft.airframe.model")

    class Meta:
        model = SurvivalPredictions
        fields = "__all__"


class AircraftList(FilterSchema):
    aircraft: List[str] = Field(None, alias="aircraft")


class FailurePredictionsOut(Schema):
    model_config = ConfigDict(protected_namespaces=())
    model: str
    wuc: str
    part_number: str
    nomenclature: str
    num_failure: str
    most_likely: str
    future_fh: str


class PhaseFlowOut(ModelSchema):
    model: str = Field("", alias="airframe.model")
    hours_to_320: float | None = Field(None, alias="hours_to_320")

    class Meta:
        model = Aircraft
        fields = [
            "serial",
            "total_airframe_hours",
            "flight_hours",
            "next_phase_type",
            "hours_to_phase",
            "current_unit",
            "owning_unit",
        ]


class PhaseFlowSubOut(Schema):
    uic: str
    aircraft: List[PhaseFlowOut]


class PhaseFlowModOut(Schema):
    model: str
    aircraft: List[PhaseFlowOut]


class PhaseFilters(FilterSchema):
    models: Optional[List[str]] = Field(None, q="airframe__model__in")
    uic: str


class BankHourFilters(FilterSchema):
    uic: str
    return_by: Literal["unit", "subordinates", "model"] = "unit"
    model: Optional[List[str]] = None


class BankHoursOut(Schema):
    key: str
    bank_percentage: float


class CompanyFilters(FilterSchema):
    aircraft: Optional[List[str]] = Field(None, q="serial__in")
    models: Optional[List[str]] = Field(None, q="airframe__model__in")


class CompanyAircraft(Schema):
    uic: str
    short_name: str = Field(None, alias="current_unit__short_name")
    display_name: str = Field(None, alias="current_unit__display_name")


class ModificationDetailOut(Schema):
    id: int
    mod_type: str
    value: Optional[str] = None


class MaintenanceEventDetailsOut(Schema):
    name: Optional[str] = None
    lane: Optional[str] = None
    event_start: Optional[datetime] = None
    event_end: Optional[datetime] = None


class EventDetailsOut(Schema):
    inspection: InspectionInfo
    maintenance: Optional[MaintenanceEventDetailsOut] = None


class AircraftDetailOut(Schema):
    serial: str = Field(alias="serial")
    remarks: Optional[str] = Field(None, alias="remarks")
    rtl: str = Field(alias="rtl")
    status: str = Field(alias="status")
    or_status: str = Field(alias="or_status")
    total_airframe_hours: float = Field(alias="total_airframe_hours")
    flight_hours: float = Field(alias="flight_hours")  # Month HR
    hours_to_phase: float = Field(alias="hours_to_phase")
    in_phase: bool = Field(alias="in_phase")
    field_sync_status: Optional[dict[str, bool]] = None
    location: Optional[LocationOut] = Field(None, alias="location")
    modifications: List[ModificationDetailOut] = []
    events: List[EventDetailsOut] = []


class ModelGroupOut(Schema):
    model: str
    aircraft: List[AircraftDetailOut]


class UnitGroupOut(Schema):
    unit_short_name: str
    models: List[ModelGroupOut]


class AircraftDetailsFilterSchema(FilterSchema):
    uic: str = Field(..., q="uic")
    serials: Optional[List[str]] = Field(None, q="serials")
