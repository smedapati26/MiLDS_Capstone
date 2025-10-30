from typing import Optional, Union

from ninja import Field, Schema

from personnel.models import SoldierDesignation
from units.api.schema import UnitOut


class SoldierDesignationOut(Schema):
    """
    Schema for returning Soldier Designation
    """

    id: int
    designation: str = Field(..., alias="designation.type")
    unit: Optional[str] = Field(None, alias="unit.display_name")
    start_date: str
    end_date: str
    last_modified_by: Optional[str] = Field(None, alias="last_modified_by.name_and_rank")
    designation_removed: bool

    @staticmethod
    def resolve_start_date(designation: SoldierDesignation):
        return designation.start_date.strftime("%m/%d/%Y")

    @staticmethod
    def resolve_end_date(designation: SoldierDesignation):
        return designation.end_date.strftime("%m/%d/%Y")


class SoldierDesignationIn(Schema):
    """
    Schema for creating a Soldier Designation
    """

    soldier_id: str
    unit_uic: str
    designation: str
    start_date: str
    end_date: Optional[str] = None
    document_type: Optional[str] = None
    supporting_document_id: Optional[Union[int | str]] = None


class SoldierDesignationResponse(Schema):
    """
    Schema for Soldier Designation API responses
    """

    message: str
    designation_id: int
