from dateutil.rrule import DAILY, MONTHLY, WEEKLY, rrule

from auto_dsr.models import Unit
from events.models import DonsaEvent, Event, EventSeries, TrainingEvent


def create_recurring_events(request_payload: dict, event_type: str):
    """
    Takes in a request payload dictionary for an event with a recurring series
    parameter and generates the series object and its respecting events

    @param request_payload: (dict) Dictionary that was passed as a part of a request
    @param event_type: (str) String to determine which type of event is being created

    @returns (dict)
        dictionary response indicating whether the operation was successful or not
    """
    series_pl = request_payload.pop("series")
    series = EventSeries.objects.create(**series_pl)
    request_payload["series"] = series
    applies_to = request_payload.pop("applies_to")
    # Create the first event which will be used to baseline remaining events
    if event_type == "training":
        base_event = TrainingEvent.objects.create(**request_payload)
        base_event.applies_to.set(applies_to)
    elif event_type == "donsa":
        base_event = DonsaEvent.objects.create(**request_payload)
        base_event.applies_to.set(applies_to)
    else:  # for now, only Training and DONSA events will be able to be recurring
        return {"success": False}

    # Generate recurring events
    generate_events(base_event, series)

    return {"id": series.id}


def generate_events(base_event: Event, series: EventSeries):
    """
    Creates all events that exist within a recurring event series.

    @param base_event: (Event (TrainingEvent|DonsaEvent)) first event in series
    @param series: (EventSeries) series object within which events are created
    """
    freq_dict = {
        "DAILY": DAILY,
        "WEEKLY": WEEKLY,
        "MONTHLY": MONTHLY,
    }

    start_date = base_event.event_start
    end_date = series.end_date
    event_length = base_event.event_end - base_event.event_start
    freq = freq_dict[series.frequency]
    days = base_event.series.days_of_week.get("days")

    rule = rrule(freq=freq, dtstart=start_date, until=end_date, byweekday=days)

    for dt in rule[1:]:
        base_event.event_start = dt
        base_event.event_end = dt + event_length
        # Django has no built in copy mechanism. Documentation suggested solution for
        # class with inheritance is to set both pk and id to None and save.
        base_event.pk = None
        base_event.id = None
        base_event.save()
