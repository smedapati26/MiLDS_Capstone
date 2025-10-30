from datetime import date
from typing import List, Optional

from ninja import FilterSchema, ModelSchema, Schema
from pydantic import ConfigDict

from aircraft.models import DA_1352


class DA_1352Out(ModelSchema):  # nosemgrep
    model_config = ConfigDict(protected_namespaces=())

    class Meta:
        model = DA_1352
        fields = [
            "id",
            "serial_number",
            "reporting_uic",
            "reporting_month",
            "model_name",
            "flying_hours",
            "fmc_hours",
            "field_hours",
            "pmcm_hours",
            "pmcs_hours",
            "dade_hours",
            "sust_hours",
            "nmcs_hours",
            "nmcm_hours",
            "total_hours_in_status_per_month",
            "total_reportable_hours_in_month",
            "last_updated",
            "source",
        ]


class StatusOverTimeOut(Schema):
    reporting_month: date
    total_fmc_hours: float
    total_field_hours: float
    total_pmcm_hours: float
    total_pmcs_hours: float
    total_dade_hours: float
    total_sust_hours: float
    total_nmcs_hours: float
    total_hours_in_status: float


class MissionsFlownOut(Schema):
    mission_type: str
    day_mission_count: int
    night_mission_count: int
    day_mission_hours: float
    night_mission_hours: float
    weather_mission_count: int
    weather_mission_hours: float


class MissionsFlownDetailOut(Schema):
    unit: str
    flight_id: str
    mission_type: str
    day_mission_hours: float
    night_mission_hours: float
    start_date: date
    stop_date: date


class MissionsFlownSummaryOut(Schema):
    mission_type: str
    amount_flown: int
    hours_flown: float


class UnitHoursFlownIn(Schema):
    uic: str
    similar_uics: Optional[List[str]] = []
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class HoursFlownDetail(Schema):
    hours_flown: float
    reporting_month: date


class HoursFlownSubUnitOut(Schema):
    parent_uic: str
    uic: str
    hours_detail: List[HoursFlownDetail]


class HoursFlownModelOut(Schema):
    model: str
    hours_detail: List[HoursFlownDetail]


class HoursFlownUnitOut(Schema):
    uic: str
    hours_detail: List[HoursFlownDetail]


class CrewOperationalReadinessOut(Schema):
    reporting_month: date
    or_rate: float
    tcrm: float
    intensity: float


class MaintenanceTimeOut(Schema):
    hours_worked: float
    similar_average_hours: float
    indicator: str
