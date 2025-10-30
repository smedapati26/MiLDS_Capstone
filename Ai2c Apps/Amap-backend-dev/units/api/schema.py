from datetime import date
from typing import Dict, List, Optional

from ninja import Field, FilterSchema, ModelSchema, Schema

from units.models import Unit


class UnitFilterSchema(FilterSchema):
    uic: str = Field(None, q="uic__icontains")
    short_name: str = Field(None, q="short_name__icontains")
    display_name: str = Field(None, q="display_name__icontains")
    nick_name: str = Field(None, q="nick_name__icontains")
    echelon: str | None = None
    compo: str | None = None
    state: str | None = None
    parent_unit: str | None = None
    level: int = None


class CreateUnitIn(Schema):
    """
    Custom Schema to provide fields for unit creation

    Note: initially only supports Task Force creation
    """

    short_name: str
    display_name: str
    nick_name: str | None = None
    echelon: str
    parent_uic: str | None = None
    start_date: date
    end_date: date

    class Config:
        extra = "forbid"


class UpdateUnitIn(Schema):
    """
    Custom Schema to ensure only changes to allowed fields are possible

    Intentionally not allowing changes to UIC fields because it would require
    updates to the UIC lists. If you are enabling it in a future update, ensure
    the appropriate changes are propagated to the API's update method.
    """

    short_name: str | None = None
    display_name: str | None = None
    nick_name: str | None = None
    echelon: str | None = None
    compo: str | None = None
    state: str | None = None
    parent_uic: str | None = None
    start_date: date | None = None
    end_date: date | None = None

    class Config:
        extra = "forbid"


class ShinyUnitOut(ModelSchema):
    class Meta:
        model = Unit
        fields = ["uic", "short_name", "display_name", "nick_name", "echelon", "parent_unit", "subordinate_uics"]


class ShinyTaskForceOut(ModelSchema):
    class Meta:
        model = Unit
        fields = ["uic", "start_date", "end_date"]


class DefaultUnitOut(ModelSchema):
    class Meta:
        model = Unit
        fields = ["uic", "short_name", "display_name", "nick_name", "echelon", "parent_unit"]


class UnitBriefOut(ModelSchema):
    class Meta:
        model = Unit
        fields = ["uic", "short_name", "display_name", "nick_name", "echelon", "parent_unit", "level"]


class UnitOut(ModelSchema):
    class Meta:
        model = Unit
        exclude = ["logo"]


class UnitUCTLInfo(Schema):
    uic: str
    short_name: str
    display_name: str
    mos_skill_levels: Dict[str, List[str]]


class UnitUCTLResponse(Schema):
    parent_unit: Optional[UnitUCTLInfo] = None
    target_unit: UnitUCTLInfo
    child_units: List[UnitUCTLInfo]
