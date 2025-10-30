from forms.models import EventType


def create_test_event_type(event_type: str = "Evaluation", description: str = "Evaluation Event") -> EventType:
    event_type = EventType.objects.get_or_create(type=event_type)[0]

    event_type.description = description
    event_type.save()

    return event_type
