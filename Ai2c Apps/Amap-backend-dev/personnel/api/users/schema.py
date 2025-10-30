from datetime import date
from typing import List, Optional

from ninja import Field, ModelSchema, Schema

from personnel.model_utils import Rank
from personnel.models import Soldier
from units.api.schema import DefaultUnitOut


class UserIn(Schema):
    """Schema for creating a new user

    Creating a user and creating a userRole are separate steps
    """

    user_id: str
    rank: Rank
    first_name: str
    last_name: str
    unit_uic: str
    is_admin: bool = False  # Is user an A-MAP developer? Defaults to false.


class UserOut(Schema):
    """
    Schema to return user objects
    """

    user_id: str
    rank: str
    first_name: str
    last_name: str
    default_unit: DefaultUnitOut = Field(None, alias="unit")
    is_admin: bool


class SoldierOut(Schema):
    user_id: str
    rank: Optional[str] = None
    first_name: str
    last_name: str
    display: str
    pv2_dor: Optional[date] = None
    pfc_dor: Optional[date] = None
    spc_dor: Optional[date] = None
    sgt_dor: Optional[date] = None
    ssg_dor: Optional[date] = None
    sfc_dor: Optional[date] = None
    unit_id: str
    dod_email: Optional[str] = None
    receive_emails: bool
    birth_month: str
    is_admin: bool
    is_maintainer: bool
    availability_status: str
    primary_mos: str
    primary_ml: Optional[str] = None
    all_mos_and_ml: dict
    designations: str
    arrival_at_unit: str
    annual_evaluation: Optional[date] = None
    evaluation_status: str


class LoginUnitRoles(Schema):
    viewer: List[str]
    recorder: List[str]
    manager: List[str]


class LoginOut(ModelSchema):
    """Schema for whoami"""

    new_user: bool = False
    default_unit: DefaultUnitOut = Field(None, alias="unit")
    has_open_requests: bool = False
    unit_roles: Optional[LoginUnitRoles] = None

    class Meta:
        model = Soldier
        fields = ["user_id", "rank", "first_name", "last_name", "is_admin"]


class MOSCodeOut(Schema):
    MOS: str
    MOS_Description: str


class UserRolesOut(Schema):
    """
    Schema to return user elevated roles
    """

    viewer: list
    recorder: list
    manager: list
