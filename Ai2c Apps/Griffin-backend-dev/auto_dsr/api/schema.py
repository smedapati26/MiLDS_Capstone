from typing import List, Optional

from ninja import Field, FilterSchema, ModelSchema, Schema

from auto_dsr.models import Location, Unit


class UnitFilter(FilterSchema):
    uic: str = Field(None, alias="uic")
    short_name: str = Field(None, q="short_name__icontains")
    display_name: str = Field(None, q="display_name__icontains")
    nick_name: str = Field(None, q="nick_name__icontains")
    echelon: str = Field(None, alias="echelon")
    parent_uic: str = Field(None, alias="parent_unit")
    level: int = Field(None, alias="level")


class UnitOut(ModelSchema):
    class Meta:
        model = Unit
        fields = ["uic", "short_name", "display_name", "nick_name", "echelon", "parent_uic", "level", "similar_units"]


class LocationFilter(FilterSchema):
    id: int = Field(None, alias="id")
    code: str = Field(None, alias="code")
    name: str = Field(None, alias="name")


class LocationOut(ModelSchema):
    class Meta:
        model = Location
        fields = ["id", "code", "name"]
