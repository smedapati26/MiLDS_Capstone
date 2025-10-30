import json

from django.http import HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_POST

from forms.model_utils import EvaluationType, EventType, TrainingType
from forms.models import Event, EventTasks, Soldier
from tasks.models import Task
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)


@require_POST
def shiny_get_event_occurrences(request: HttpRequest):
    """
    Retrieves 10 most recent historical occurrences and outcomes of a specific event (Training, Evaluation, Task Completion) for an individual

    @param request: HttpRequest
        - The POST request body must be structured as follows:
            {
            "soldier_id": (str) The id of the soldier whose history with a specific Training/Evaluation/Task you are retrieving,
            "event_info": (str) The specific event (type of Training or Evaluation, or Task Number) to retrieve history for,
            }

    @returns (JsonResponse)
    """
    data: dict = json.loads(request.body)

    # Get soldier object
    try:
        soldier_id = data["soldier_id"]
        soldier = Soldier.objects.get(user_id=soldier_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    # Get all valid values for evaluation and training types, and task numbers
    all_evaluation_values = [str(eval_type[0]) for eval_type in EvaluationType.choices]
    all_training_values = [str(train_type[0]) for train_type in TrainingType.choices]
    all_task_numbers = [task["task_number"] for task in Task.objects.all().values("task_number")]

    event_info = data.get("event_info", None)

    return_data = []

    if event_info in all_evaluation_values:
        soldier_evaluations = Event.objects.filter(
            soldier=soldier,
            event_type__type=EventType.Evaluation,
            evaluation_type__type=event_info,
        ).order_by("-date")
        for eval in soldier_evaluations[:10]:
            return_data.append(
                {"event_type": "Evaluation", "event_info": event_info, "date": eval.date, "result": eval.go_nogo}
            )

    elif event_info in all_training_values:
        soldier_trainings = Event.objects.filter(
            soldier=soldier,
            event_type__type=EventType.Training,
            training_type__type=event_info,
        ).order_by("-date")
        for training in soldier_trainings[:10]:
            return_data.append(
                {
                    "event_type": "Training",
                    "event_info": event_info,
                    "date": training.date,
                    "result": training.go_nogo,
                }
            )
    elif event_info in all_task_numbers:
        task_completion = EventTasks.objects.filter(
            event__soldier=soldier,
            task__task_number=event_info,
        ).order_by("-event__date")
        for task in task_completion[:10]:
            return_data.append(
                {
                    "event_type": task.event.event_type.type,
                    "event_info": task.task.task_number + " - " + task.task.task_title,
                    "date": task.event.date,
                    "result": task.event.go_nogo,
                }
            )
    else:
        pass

    return JsonResponse(return_data, safe=False)
