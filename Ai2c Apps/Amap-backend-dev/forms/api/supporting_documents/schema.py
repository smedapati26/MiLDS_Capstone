from datetime import date
from typing import List, Optional, Union

from ninja import Field, Schema

from forms.model_utils import EventType
from forms.models import Event, SupportingDocument
from personnel.api.users.schema import SoldierOut


class SupportingDocumentTypeOut(Schema):
    id: int
    type: str


class SupportingDocumentAssociatedEventOut(Schema):
    id: int
    date: str
    event_type: str = Field(..., alias="event_type.type")
    event_sub_type: str

    @staticmethod
    def resolve_date(event: Event):
        return event.date.strftime("%m/%d/%Y")

    @staticmethod
    def resolve_event_sub_type(event: Event):
        if event.event_type.type == EventType.Training and event.training_type:
            return event.training_type.type
        elif event.event_type.type == EventType.Evaluation and event.evaluation_type:
            return event.evaluation_type.type
        elif event.event_type.type == EventType.Award and event.award_type:
            return event.award_type.type

        return ""


class SupportingDocumentIn(Schema):
    document_title: str
    document_type: str
    document_date: date
    related_event_id: Optional[Union[int, str]] = None
    related_designation_id: Optional[Union[int, str]] = None


class SupportingDocumentUpdateIn(Schema):
    document_title: Optional[str] = None
    document_type: Optional[str] = None
    visible_to_user: Optional[bool] = None
    related_event_id: Optional[Union[int, str]] = None
    related_designation_id: Optional[Union[int, str]] = None
    associate_event: Optional[bool] = None
    assign_designation: Optional[bool] = None


class SupportingDocumentResponse(Schema):
    message: str
    success: bool = True


class SupportingDocumentOut(Schema):
    id: int
    soldier: SoldierOut
    uploaded_by: Optional[str] = Field(..., alias="uploaded_by.name_and_rank")
    upload_date: str
    document_date: str
    document_title: str
    document_type: Optional[str] = Field(..., alias="document_type.type")
    related_event: Optional[SupportingDocumentAssociatedEventOut] = None
    related_designation: Optional[str] = Field(None, alias="related_designation.designation.type")
    visible_to_user: bool = True

    class Config:
        populate_by_name = True


class DesignationSupportingDocsResponse(Schema):
    associated_supporting_docs: List[SupportingDocumentOut] = []
