from typing import Optional

from ninja import Field, ModelSchema, Schema

from auto_dsr.api.users.schema import UserBriefOut
from auto_dsr.models import UserRole
from units.api.schema import UnitBriefOut


class UserRoleOut(ModelSchema):
    """Model Schema for UserRole input and output"""

    user: UserBriefOut = Field(..., alias="user_id")
    unit: UnitBriefOut = Field(..., alias="unit")

    class Meta:
        model = UserRole
        fields = ["id", "access_level", "granted_on"]


class UserRoleIn(Schema):
    """Schema for UserRole create"""

    user_id: str
    unit_uic: str
    access_level: str
