from forms.models import EventTasks, DA_7817
from tasks.models import Task


def create_test_event_task(
    event: DA_7817,
    task=Task,
    id: int = 1,
) -> EventTasks:
    event_task = EventTasks.objects.create(id=id, event=event, task=task)

    return event_task
