from datetime import date, datetime
from typing import List, Optional

from django.db.models import Q
from django.utils.timezone import datetime, now
from ninja import Field, FilterSchema, ModelSchema, Schema

from aircraft.api.inspections.schema import InspectionReferenceOut
from aircraft.models import Aircraft, Airframe, Inspection, InspectionReference
from auto_dsr.models import Location, Unit, User
from events.model_utils import MaintenanceTypes
from events.models import DonsaEvent, EventSeries, MaintenanceEvent, MaintenanceLane, MaintenanceRequest, TrainingEvent


#### Schemas used for nested maintenance calendar API ####
class AirframeSchema(ModelSchema):
    class Meta:
        model = Airframe
        fields = ["mds", "model"]


class AircraftSchema(ModelSchema):
    airframe: AirframeSchema

    class Meta:
        model = Aircraft
        fields = ["serial", "current_unit"]


class InspectionSchema(ModelSchema):
    class Meta:
        model = Inspection
        fields = ["inspection_name", "hours_interval"]


class InspectionReferenceSchema(ModelSchema):
    class Meta:
        model = InspectionReference
        fields = ["id", "common_name", "code", "is_phase"]


class UserSchema(ModelSchema):
    class Meta:
        model = User
        fields = ["user_id", "rank", "first_name", "last_name"]


class LocationSchema(ModelSchema):
    class Meta:
        model = Location
        fields = ["name", "short_name", "code"]


class EventSeriesIn(ModelSchema):
    class Meta:
        model = EventSeries
        fields = ["frequency", "interval", "days_of_week", "end_date"]
        fields_optional = "__all__"


#### Maintenance Event Schemas ####
class MaintenanceEventIn(ModelSchema):
    poc_id: str = None
    alt_poc_id: str = None
    aircraft_id: str = None
    inspection_id: int = None
    lane_id: int = None
    inspection_reference_id: int = None
    maintenance_type: MaintenanceTypes = None

    class Meta:
        model = MaintenanceEvent
        fields = ["event_start", "event_end", "notes"]
        fields_optional = "__all__"


class MaintenanceEventOut(ModelSchema):
    aircraft: AircraftSchema
    is_phase: bool = Field(False, alias="inspection_reference.is_phase")
    inspection_reference: Optional[InspectionReferenceSchema]

    class Meta:
        model = MaintenanceEvent
        fields = [
            "id",
            "event_start",
            "event_end",
            "notes",
            "poc",
            "alt_poc",
            "aircraft",
            "inspection",
            "lane",
            "maintenance_type",
        ]


#### Training Event Schemas ####
class TrainingEventIn(ModelSchema):
    poc_id: str = None
    alt_poc_id: str = None
    unit_id: str = None
    series: EventSeriesIn = None
    applies_to: List[str] = []

    class Meta:
        model = TrainingEvent
        fields = ["event_start", "event_end", "notes", "name"]
        fields_optional = "__all__"


class TrainingEventOut(ModelSchema):
    class Meta:
        model = TrainingEvent
        fields = ["id", "event_start", "event_end", "notes", "poc", "alt_poc", "name", "unit"]


#### DONSA Event Schemas ####
class DonsaEventIn(ModelSchema):
    poc_id: str = None
    alt_poc_id: str = None
    unit_id: str = None
    series: EventSeriesIn = None
    applies_to: List[str] = []

    class Meta:
        model = DonsaEvent
        fields = ["event_start", "event_end", "notes", "name"]
        fields_optional = "__all__"


class DonsaEventOut(ModelSchema):
    class Meta:
        model = DonsaEvent
        fields = ["id", "event_start", "event_end", "notes", "poc", "alt_poc", "name", "unit"]


#### Maintenance Lane Schemas ####
class MaintenanceLaneIn(ModelSchema):
    unit_id: str = None
    location_id: int = None
    airframes: List[str] = None

    class Meta:
        model = MaintenanceLane
        fields = ["name", "contractor", "internal"]
        fields_optional = "__all__"


class MaintenanceLaneEdit(ModelSchema):
    unit_id: str = None
    location_id: int = None
    airframes: List[str] = None

    class Meta:
        model = MaintenanceLane
        fields = ["name", "contractor", "internal"]
        fields_optional = "__all__"


class MaintenanceLaneOut(ModelSchema):
    location: Optional[LocationSchema]
    airframe_families: List[str] = None
    subordinate_units: List[str] = Field([], alias="unit.child_uics")

    class Meta:
        model = MaintenanceLane
        fields = ["id", "unit", "name", "contractor", "internal"]

    @staticmethod
    def resolve_airframe_families(obj) -> List[str]:
        # This resolver gets distinct airframe families for the MaintenanceLane
        return list(obj.airframes.values_list("family", flat=True).distinct())


#### Fully Nested Schema for Maintenance Calendar ####
class MaintenanceEventSchema(ModelSchema):
    aircraft: AircraftSchema
    lane: MaintenanceLaneOut
    inspection: Optional[InspectionSchema]
    inspection_reference: Optional[InspectionReferenceOut]

    class Meta:
        model = MaintenanceEvent
        fields = [
            "id",
            "event_start",
            "event_end",
            "notes",
            "aircraft",
            "lane",
            "poc",
            "alt_poc",
            "inspection",
            "maintenance_type",
        ]


#### Upcoming Maintenance Filter ####
class UpcomingMaintenance(FilterSchema):
    uic: Optional[str] = Field(None, q="aircraft__uic")
    is_phase: bool = Field(None, q="inspection_reference__is_phase")
    event_end: datetime = Field(now(), q="event_end__gte")
    other_uics: Optional[List[str]] = Field(None, q="aircraft__uic__in")

    def filter_is_phase(self, value: bool) -> Q:
        """Filter is phase field.

        If passed value is true, return filter where is phase is set to True.
        If passed value is false, return filter where is phase is false or inspection reference is null
        If passed value is None, do not filter on is phase.
        """
        if value:
            return Q(inspection_reference__is_phase=value)
        elif value is False:
            return Q(inspection_reference__is_phase=value) | Q(inspection_reference__isnull=True)
        return Q()


#### Unscheduled Maintenance Items ####
class MaintenanceCountsSchema(Schema):
    reporting_period: date
    unscheduled: int
    scheduled: int


#### Event Calendar ####
class EventCalendarOut(Schema):
    event_id: int
    event_start: datetime
    event_end: datetime
    name: str | None
    type: str
    aircraft: str | None
    uic: str


#### DSR Maintenance Detail ####
class DSRMaintenanceDetailOut(Schema):
    serial: str
    model: str
    inspection_name: str
    status: float
    lane_name: str
    responsible_unit: str
    start_date: datetime
    end_date: datetime
    current_upcoming: str


class DSRMaintenanceDetailIn(FilterSchema):
    serials: Optional[List[str]] = Field(None, q="serial__in")
    models: Optional[List[str]] = Field(None, q="model__in")
    inspections: Optional[List[str]] = Field(None, q="inspection_name__in")
    lanes: Optional[List[str]] = Field(None, q="lane__in")
    responsible_units: Optional[List[str]] = Field(None, q="responsible_unit__in")
    start_date_begin: Optional[datetime] = Field(None, q="start_date__gte")
    start_date_end: Optional[datetime] = Field(None, q="start_date__lte")
    end_date_begin: Optional[datetime] = Field(None, q="end_date__gte")
    end_date_end: Optional[datetime] = Field(None, q="end_date__lte")
    current_upcoming: Optional[str] = Field(None, q="current_upcoming")


# check if needed
class MaintenanceLaneSchema(ModelSchema):
    class Meta:
        model = MaintenanceLane
        fields = ["name", "contractor", "internal"]


class MaintenanceRequestIn(ModelSchema):
    class Meta:
        model = MaintenanceRequest
        fields = [
            "requested_maintenance_lane",
            "requested_aircraft",
            "requested_by_user",
            "requested_maintenance_type",
            "requested_inspection",
            "requested_inspection_reference",
            "name",
            "requested_start",
            "requested_end",
            "notes",
            "poc",
            "alt_poc",
            "requested_by_uic",
            "date_requested",
            "decision_date",
            "maintenance_approved",
        ]


# check if needed
class UnitSchema(ModelSchema):
    class Meta:
        model = Unit
        fields = [
            "uic",
            "short_name",
            "display_name",
            "slogan",
            "nick_name",
            "echelon",
            "parent_uic",
            "parent_uics",
            "child_uics",
            "subordinate_uics",
        ]


class MaintenanceRequestOut(ModelSchema):
    requested_maintenance_lane: MaintenanceLaneSchema
    requested_aircraft: AircraftSchema
    requested_by_user: UserSchema
    requested_inspection: Optional[InspectionSchema] = None
    requested_inspection_reference: Optional[InspectionReferenceSchema] = None
    requested_by_uic: UnitSchema

    class Meta:
        model = MaintenanceRequest
        fields = [
            "id",
            "requested_maintenance_lane",
            "requested_aircraft",
            "requested_by_user",
            "requested_maintenance_type",
            "requested_inspection",
            "requested_inspection_reference",
            "name",
            "requested_start",
            "requested_end",
            "notes",
            "poc",
            "alt_poc",
            "requested_by_uic",
            "date_requested",
            "decision_date",
            "maintenance_approved",
        ]
