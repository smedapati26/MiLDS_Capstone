from consistency.models import LogicalClock


def create_logical_clock(model: str, current_time: int = 0) -> LogicalClock:
    """
    This will create a LogicalClock object from manager.models

    @param model: (str) The model the clock is in reference to
    @param current_time: (int)

    @returns LogicalClock
    """
    return LogicalClock.objects.create(model=model, current_time=current_time)
