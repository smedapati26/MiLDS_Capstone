from typing import Dict

from pydantic import BaseModel


class ModChangeIn(BaseModel):
    serial_number: str
    mod: str
    value: str


class ChangesIn(BaseModel):
    changes: Dict[str, ModChangeIn]
