from aircraft.models import Aircraft
from agse.models import AGSE
from auto_dsr.models import Unit
from supply.models import PartsOrder


def create_single_test_parts_order(
    unit: Unit,
    dod_document_number: str = "W012345678901234",
    carrier: str = "UPS",
    carrier_tracking_number: str = "0123456789",
    aircraft: Aircraft | None = None,
    agse: AGSE | None = None,
    is_visible: bool = True,
) -> PartsOrder:
    """
    Creates a single PartsOrder object.

    @param unit: (Unit) The Unit object the new PartsOrder is being tracked by
    @param dod_document_number: (str) The primary key value for the new PartsOrder
    @param carrier: (str) The carrier
    @param carrier_tracking_number: (str) The carrier's tracking number
    @param aircraft: (Aircraft | None) The Aircraft
    @param agse: (AGSE | None) The AGSE
    @param is_visible: (bool) flag to indicate if the unit wants to view it

    @returns (PartsOrder)
            The newly created PartsOrder object.
    """
    return PartsOrder.objects.create(
        dod_document_number=dod_document_number,
        carrier=carrier,
        carrier_tracking_number=carrier_tracking_number,
        unit=unit,
        aircraft=aircraft,
        agse=agse,
        is_visible=is_visible,
    )
