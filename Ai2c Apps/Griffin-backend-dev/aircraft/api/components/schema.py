from typing import List, Optional

from ninja import Field, FilterSchema, ModelSchema, Schema
from pydantic import ConfigDict

from aircraft.models import Aircraft, Airframe, ShortLife, SurvivalPredictions


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


class SurvivalPredictionsOut(ModelSchema):
    aircraft_model: str = Field("", alias="aircraft.airframe.model")

    class Meta:
        model = SurvivalPredictions
        fields = "__all__"


class AircraftList(FilterSchema):
    aircraft: List[str] = Field(None, alias="aircraft")


class ShinyFailurePredictionsOut(Schema):
    model: str
    wuc: str
    part_number: str
    nomenclature: str
    num_failure: str
    most_likely: str
    future_fh: str


class ComponentSurvivalDetailOut(Schema):
    failure_prob_5: float
    failure_upper_5: float
    failure_lower_5: float
    failure_prob_10: float
    failure_upper_10: float
    failure_lower_10: float
    failure_prob_15: float
    failure_upper_15: float
    failure_lower_15: float
    failure_prob_20: float
    failure_upper_20: float
    failure_lower_20: float
    failure_prob_25: float
    failure_upper_25: float
    failure_lower_25: float
    failure_prob_30: float
    failure_upper_30: float
    failure_lower_30: float
    failure_prob_35: float
    failure_upper_35: float
    failure_lower_35: float
    failure_prob_40: float
    failure_upper_40: float
    failure_lower_40: float
    failure_prob_45: float
    failure_upper_45: float
    failure_lower_45: float
    failure_prob_50: float
    failure_upper_50: float
    failure_lower_50: float
    failure_prob_55: float
    failure_upper_55: float
    failure_lower_55: float
    failure_prob_60: float
    failure_upper_60: float
    failure_lower_60: float
    failure_prob_65: float
    failure_upper_65: float
    failure_lower_65: float
    failure_prob_70: float
    failure_upper_70: float
    failure_lower_70: float
    failure_prob_75: float
    failure_upper_75: float
    failure_lower_75: float
    failure_prob_80: float
    failure_upper_80: float
    failure_lower_80: float
    failure_prob_85: float
    failure_upper_85: float
    failure_lower_85: float
    failure_prob_90: float
    failure_upper_90: float
    failure_lower_90: float
    failure_prob_95: float
    failure_upper_95: float
    failure_lower_95: float
    failure_prob_100: float
    failure_upper_100: float
    failure_lower_100: float


class ComponentFailurePredictionOut(Schema):
    part_number: str
    nomenclature: str
    failure_detail: ComponentSurvivalDetailOut


class ComponentFailureFilters(FilterSchema):
    uic: str
    variant: str = "top"
    serial_numbers: List[str] = []
    part_numbers: List[str] = []
    other_uics: List[str] = []


class ModelFailurePredictionOut(Schema):
    model_config = ConfigDict(protected_namespaces=())
    model_name: str
    failure_detail: ComponentSurvivalDetailOut


class AircraftFailurePredictionOut(Schema):
    serial_number: str
    failure_detail: ComponentSurvivalDetailOut


class AircraftFailureFilters(FilterSchema):
    uic: str
    variant: str = "top"
    serial_numbers: List[str] = []
    part_numbers: List[str] = []
    other_uics: List[str] = []


class FailureCountFilters(FilterSchema):
    uic: str
    hour: int
    failure_percentage: float = 0
    other_uics: List[str] = []


class FailureCountOut(Schema):
    part_number: str
    nomenclature: str
    model: str
    serial: str
    failure_chance: float
    work_unit_code: str


class LongevityFilter(FilterSchema):
    part_number: str
    uic: str
    model: Optional[str] = None


class LongevityOut(Schema):
    tbo: float
    value_type: str
    unit_average: float
    fleet_average: float


class PartListOut(Schema):
    part_number: str
    models: List[str]
