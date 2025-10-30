from ninja import Field, ModelSchema

from auto_dsr.api.users.schema import UserBriefOut
from auto_dsr.models import UserRequest
from units.api.schema import UnitBriefOut


class AdminRoleRequestOut(ModelSchema):
    """Schema for returning User Role Request objects."""

    user: UserBriefOut = Field(..., alias="user_id")
    unit: UnitBriefOut = Field(..., alias="uic")
    current_role: str

    class Meta:
        model = UserRequest
        fields = ["id", "access_level", "date_created"]
