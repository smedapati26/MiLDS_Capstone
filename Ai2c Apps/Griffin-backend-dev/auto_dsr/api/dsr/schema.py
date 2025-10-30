from datetime import date, datetime
from typing import List, Optional

from django.utils import timezone
from ninja import Field, FilterSchema, ModelSchema, Schema

from aircraft.models import DA_2407


class LocationOut(Schema):
    name: Optional[str] = Field(alias="name", default=None)
    short_name: Optional[str] = Field(alias="short_name", default=None)
    abbreviation: Optional[str] = Field(alias="abbreviation", default=None)
    code: Optional[str] = Field(alias="code", default=None)
    mgrs: Optional[str] = Field(alias="mgrs", default=None)


class ModificationOut(Schema):
    mod_type: Optional[str] = Field(alias="mod_type.name", default=None)
    value: Optional[str] = None


class DsrOut(Schema):
    serial_number: str = Field(alias="serial")
    owning_unit_uic: str = Field(alias="owning_unit.uic")
    owning_unit_name: str = Field(alias="owning_unit.short_name")
    location: Optional[LocationOut] = Field(alias="location", default=None)
    model: str = Field(alias="airframe.mds")
    status: str = Field(alias="status")
    rtl: str = Field(alias="rtl")
    remarks: Optional[str] = Field(alias="remarks")
    date_down: Optional[date] = Field(alias="date_down")
    ecd: Optional[date] = Field(alias="ecd")
    hours_to_phase: float = Field(alias="hours_to_phase")
    flying_hours: float = Field(alias="flight_hours")
    last_sync_time: datetime = Field(alias="last_sync_time")
    last_export_upload_time: datetime = Field(alias="last_export_upload_time")
    last_user_edit_time: datetime = Field(alias="last_update_time")
    data_update_time: datetime = Field(default_factory=timezone.now)
    modifications: List[ModificationOut] = []


class DsrFilterSchema(FilterSchema):
    uic: Optional[str] = Field(None, q="uic")
    transient: Optional[bool] = Field(None, q="transient")


class Da2407In(ModelSchema):
    class Meta:
        model = DA_2407
        fields = [
            "uic_work_order_number",
            "work_order_number",
            "customer_unit",
            "support_unit",
            "shop",
            "remarks",
            "malfunction_desc",
            "deficiency",
            "aircraft",
            "submitted_datetime",
            "accepted_datetime",
            "work_start_datetime",
            "when_discovered",
            "how_discovered",
            "workflow_state",
        ]
        fields_optional = [
            "work_start_datetime",
            "remarks",
            "malfunction_desc",
            "deficiency",
            "aircraft",
            "workflow_state",
        ]


class Da2407Out(ModelSchema):
    last_modified: datetime | None = None

    class Meta:
        model = DA_2407
        fields = "__all__"

    @staticmethod
    def resolve_last_modified(obj: DA_2407):
        """Fetches the most recent history entry for this instance."""
        history_entry = obj.history.first()
        return history_entry.history_date if history_entry else None


class FlyingHoursOut(Schema):
    monthly_hours_flown: float
    monthly_hours_total: float
    yearly_hours_flown: float
    yearly_hours_total: float


class PhaseFlowOrder(Schema):
    uic: str
    serial: str
    phase_order: int


class PhaseFlowOrderIn(Schema):
    serial: str
    phase_order: int
