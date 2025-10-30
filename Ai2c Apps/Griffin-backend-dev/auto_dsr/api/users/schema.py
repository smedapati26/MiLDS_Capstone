import datetime
from typing import Optional

from ninja import Field, ModelSchema, Schema

from auto_dsr.model_utils import UserRank
from auto_dsr.models import User
from units.api.schema import DefaultUnitOut


class UserIn(Schema):
    """Schema for creating a new user

    Creating a user and creating a userRole are separate steps
    """

    user_id: str
    rank: UserRank
    first_name: str
    last_name: str
    unit_uic: str
    global_unit_uic: Optional[str] = None
    job_description: Optional[str] = None
    is_admin: bool = False  # Is user a griffin.ai developer? Defaults to false.


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
    global_unit: Optional[DefaultUnitOut] = Field(None, alias="global_unit")
    job_description: Optional[str] = None
    last_activity: Optional[datetime.datetime] = None


class UserRolesOut(Schema):
    """
    Schema to return user elevated roles
    """

    admin: list
    write: list


class LoginOut(ModelSchema):
    """Schema for whoami"""

    new_user: bool = False
    default_unit: DefaultUnitOut = Field(None, alias="unit")
    global_unit: Optional[DefaultUnitOut] = Field(None, alias="global_unit")

    class Meta:
        model = User
        fields = ["user_id", "rank", "first_name", "last_name", "job_description", "is_admin"]


class UserBriefOut(ModelSchema):
    """Simplified User Schema with minimum fields required to display user data"""

    class Meta:
        model = User
        fields = ["user_id", "rank", "first_name", "last_name", "email", "last_activity"]
