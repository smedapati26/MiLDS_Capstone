from forms.model_utils import EvaluationResult
from forms.models import Event, EventTasks
from tasks.models import Task


def create_test_event_task(event: Event, task=Task, id: int = 1, go_nogo: str = EvaluationResult.GO) -> EventTasks:
    event_task = EventTasks.objects.create(id=id, event=event, task=task, go_nogo=go_nogo)
    return event_task
