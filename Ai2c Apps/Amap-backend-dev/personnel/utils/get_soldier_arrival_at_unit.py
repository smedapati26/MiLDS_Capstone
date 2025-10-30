from forms.models import Event
from personnel.models import Soldier


def get_soldier_arrival_at_unit(soldier: Soldier):
    """
    Calculate a soldier's arrival at their current unit using the following logic:
        1. First, look at most recent PCS Event where the gaining unit is their current unit
        2. If no such event exists (the soldier was transferred but never made a record for that transfer)
            - Use Django Simplehistory to return the date that the soldier's unit most recently changed
        3. If soldier has never been transferred and has no PCS Events (soldier was moved before simplehistory was implemented)
            - Return "Unknown"
    Returns: Date of arrival in "mm-dd-YYYY" string format, or "Unknown"
    """
    # First, looks at events for the PCS to the unit
    pcs_to_unit = (
        Event.objects.filter(soldier=soldier, gaining_unit=soldier.unit, event_deleted=False).order_by("-date").first()
    )
    if pcs_to_unit:
        return pcs_to_unit.date.strftime("%m-%d-%Y")

    # If no PCS event to current unit, get date of last unit change from Django Simplehistory
    historical_records = soldier.history.order_by("-history_date")
    previous_date = historical_records.first().history_date
    for record in historical_records:
        if record.unit_id != soldier.unit.uic:
            return previous_date.strftime("%m-%d-%Y")
        previous_date = record.history_date

    # Otherwise return "Unknown" for soldier arrival to unit
    return "Unknown"
