from typing import Optional

from ninja import Field, ModelSchema

from auto_dsr.api.users.schema import UserBriefOut
from auto_dsr.models import UserRequest
from units.api.schema import UnitBriefOut


class UserRequestIn(ModelSchema):
    user_id: str
    uic: str

    class Meta:
        model = UserRequest
        fields = ["access_level"]
        fields_optional = "__all__"


class UserRequestOut(ModelSchema):
    """Schema for returning user role requests"""

    unit: UnitBriefOut = Field(..., alias="uic")
    approvers: list[UserBriefOut] = []

    class Meta:
        model = UserRequest
        fields = ["id", "user_id", "access_level", "date_created"]
