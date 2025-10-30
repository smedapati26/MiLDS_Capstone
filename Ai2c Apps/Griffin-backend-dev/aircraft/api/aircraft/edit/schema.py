from typing import List, Optional

from ninja import Field, ModelSchema, Schema

from aircraft.api.aircraft.schema import ModificationDetailOut
from aircraft.models import Aircraft


class AircraftEditIn(Schema):
    """Schema for a single aircraft edit operation"""

    class Config:
        extra = "forbid"

    serial: str

    rtl: Optional[str] = None
    status: Optional[str] = None
    total_airframe_hours: Optional[float] = None
    flight_hours: Optional[float] = None
    location_id: Optional[int] = None
    remarks: Optional[str] = None
    field_sync_status: Optional[dict[str, bool]] = None
    mods: Optional[List[ModificationDetailOut]] = None


class AircraftEditOut(Schema):
    """Schema for aircraft edit successes and failures"""

    edited_aircraft: List[str]
    not_edited_aircraft: List[str]
    detail: Optional[str] = None
