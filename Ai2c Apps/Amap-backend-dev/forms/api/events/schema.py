from datetime import date
from enum import Enum
from typing import List, Optional, Union

from ninja import Field, Schema

from forms.model_utils import TaskResult
from units.api.schema import UnitOut

Go_NoGoEnum = Enum("Go_NoGoEnum", {choice[0]: choice[0] for choice in TaskResult.choices}, type=str)


class EventTask(Schema):
    number: str
    name: Optional[str]
    go_nogo: Go_NoGoEnum  # type: ignore


class EventOut(Schema):
    id: int
    soldier_id: str
    date: str
    uic_id: str
    go_nogo: Optional[str] = None
    total_mx_hours: Optional[float] = None
    comment: str = ""
    maintenance_level: Optional[str] = None
    event_deleted: bool = False
    mass_entry_key: Optional[str] = None
    event_type: Optional[str] = Field(None, alias="event_type__type")
    training_type: Optional[str] = Field(None, alias="training_type__type")
    evaluation_type: Optional[str] = Field(None, alias="evaluation_type__type")
    award_type: Optional[str] = Field(None, alias="award_type__type")
    tcs_location: Optional[str] = Field(None, alias="tcs_location__abbreviation")
    gaining_unit_id: Optional[str] = None
    gaining_unit: Optional[UnitOut] = None
    mos: Optional[str] = Field(None, alias="mos__mos")
    recorded_by_id: Optional[str] = None
    recorded_by_legacy: Optional[str] = None
    recorder: Optional[str] = None
    attached_da_4856_id: Optional[int] = None
    event_tasks: Optional[List[EventTask]] = None
    has_associations: bool = False

    class Config:
        populate_by_name = True

    # @staticmethod
    # def resolve_date(event: Event):
    #     return event.date.strftime("%m/%d/%Y")


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


class UpdateEventIn(Schema):
    date: Optional[str] = None
    event_type: Optional[str] = None
    training_type: Optional[str] = None
    evaluation_type: Optional[str] = None
    award_type: Optional[str] = None
    tcs_location: Optional[str] = None
    go_nogo: Optional[str] = None
    gaining_unit: Optional[str] = None
    comments: Optional[str] = None
    mx_hours: Optional[float] = None
    ml: Optional[str] = None
    mos: Optional[str] = None
    event_tasks: Optional[List[EventTask]] = None


class UpdateEventOut(Schema):
    message: str
    success: bool
    event_id: int


class DA7817Response(Schema):
    da_7817s: List[EventOut]


class Add7817Request(Schema):
    date: str
    uic: str
    event_type: str
    training_type: Optional[str] = None
    evaluation_type: Optional[str] = None
    go_nogo: Optional[str] = TaskResult.NA
    award_type: Optional[str] = None
    tcs_location: Optional[str] = None
    comments: Optional[str] = None
    maintenance_level: Optional[str] = None
    recorded_by: Optional[str] = None
    recorded_by_legacy: Optional[str] = None
    mass_entry_key: Optional[str] = None
    total_mx_hours: Optional[Union[float, str]] = None
    gaining_unit: Optional[str] = None
    event_tasks: Optional[List[EventTask]] = None
    mos: Optional[str] = None


class MassTrainingSoldier(Schema):
    soldier_id: str
    go_nogo: Go_NoGoEnum  # type: ignore
    comments: str
    event_tasks: Optional[List[EventTask]] = None


class MassTrainingRequest(Add7817Request):
    soldiers: List[MassTrainingSoldier]


class EventDocumentOut(Schema):
    id: int
    title: str
    file_path: str
    type: str
