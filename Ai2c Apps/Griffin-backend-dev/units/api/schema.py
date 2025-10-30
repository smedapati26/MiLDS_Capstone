from datetime import date

from ninja import Field, FilterSchema, ModelSchema, Schema

from units.models import Unit


class UnitFilterSchema(FilterSchema):
    uic: str = Field(None, q="uic__icontains")
    short_name: str = Field(None, q="short_name__icontains")
    display_name: str = Field(None, q="display_name__icontains")
    nick_name: str = Field(None, q="nick_name__icontains")
    echelon: str = None
    compo: str = None
    state: str = None
    parent_unit: str = None
    level: int = None


class CreateUnitIn(Schema):
    """
    Custom Schema to provide fields for unit creation

    Note: initially only supports Task Force creation
    """

    short_name: str
    display_name: str
    nick_name: str = None
    echelon: str
    parent_uic: str = None
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

    short_name: str = None
    display_name: str = None
    nick_name: str = None
    echelon: str = None
    compo: str = None
    state: str = None
    parent_uic: str = None
    start_date: date = None
    end_date: date = None

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
