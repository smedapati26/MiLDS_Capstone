from typing import List

from ninja import ModelSchema, Schema


class UnitUICList(Schema):
    uics: List[str]
