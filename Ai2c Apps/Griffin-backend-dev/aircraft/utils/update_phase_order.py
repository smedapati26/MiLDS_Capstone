from aircraft.models import UnitPhaseFlowOrdering


def update_phase_order(uic: str):
    """
    Update the phase order table.
    1. Verify aircraft is owned by the UIC.
        a. If not, delete aircraft from phase order table.
    2. Loop through table and reset order if any were deleted.
    """
    phase_orders = UnitPhaseFlowOrdering.objects.filter(uic=uic).order_by("phase_order")
    # Verify all aircraft are assigned to the UIC
    for phase_order in phase_orders:
        if uic not in phase_order.serial.uic.values_list("uic", flat=True):
            phase_order.delete()

    index = 0
    # Reindex to make sure order does not have gaps
    for phase_order in UnitPhaseFlowOrdering.objects.filter(uic=uic).order_by("phase_order"):
        phase_order.phase_order = index
        phase_order.save()
        index += 1
