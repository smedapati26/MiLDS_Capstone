from django.http import HttpRequest, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_POST
from django.db.models import Max, Min
from datetime import datetime
import json

from forms.models import DA_7817, Unit, Soldier, EventTasks, EvaluationType, TrainingType
from forms.model_utils import EventType as OldEventType, EvaluationResult
from tasks.models import Task

from utils.logging import log_api_call
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_404_UNIT_DOES_NOT_EXIST,
)


@log_api_call
@require_POST
def get_unit_tracker_data(request: HttpRequest):
    """
    Retrieves all associated data for 7817s associated with passed in Units and other filterable data.

    @param request: HttpRequest
        - The POST request body must be structured as follows:
            {
            "unit_uic": list(str) The unit_uic that data should be retrieved for along with its subordinate units,
            "events": list(str) The types of Events that data should be passed back for; currently supporting Eval and Training,
            "event_types": list(str) The Event subtypes (of Evaluations and Trainings) that should be queried,
            "start_date": (str) The earliest that Events should be considered for their data,
            "end_date": (str) The latest that Events should be considered for their data,
            "birth_months": list(str) The birth months to be considered when filtering soldiers
            "recent_vs_count": (str) Whether to return just the most recent occurence of the Training/Evaluation/Task, or the total
            number of occurences within the time period passed
            }

    @returns (JsonResponse)
    """
    data: dict = json.loads(request.body)

    # Retrieve the Units being filtered on
    try:
        desired_unit_uic = data["unit_uic"]
        desired_unit = Unit.objects.get(uic=desired_unit_uic)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    desired_units = [desired_unit_uic, *desired_unit.subordinate_uics]

    # Get the values for filtering and initialization
    all_evaluation_values = EvaluationType.objects.all().values_list("type", flat=True)
    all_training_values = TrainingType.objects.all().values_list("type", flat=True)
    all_task_numbers = [task["task_number"] for task in Task.objects.all().values("task_number")]

    events = data.get("events", [])
    event_types = data.get("event_types", [])
    event_types = [event_types] if not isinstance(event_types, list) else event_types
    desired_evaluation_types = []
    desired_training_types = []
    desired_task_numbers = []
    if "Evaluation" in events:
        desired_evaluation_types = [event_type for event_type in event_types if event_type in all_evaluation_values]
    if "Training" in events:
        desired_training_types = [event_type for event_type in event_types if event_type in all_training_values]
    if "Tasks" in events:
        desired_task_numbers = [event_type for event_type in event_types if event_type in all_task_numbers]

    desired_birth_months = data.get("birth_months", [])
    desired_birth_months = (
        [desired_birth_months] if not isinstance(desired_birth_months, list) else desired_birth_months
    )

    start_date = datetime.strptime(data.get("start_date"), "%Y-%m-%d").date()
    end_date = datetime.strptime(data.get("end_date"), "%Y-%m-%d").date()

    applicable_soldiers = Soldier.objects.filter(
        unit__in=desired_units, is_maintainer=True, birth_month__in=desired_birth_months
    )

    return_data = []

    for soldier in applicable_soldiers:
        current_data = {
            "DODID": soldier.user_id,
            "Soldier Name": soldier.name_and_rank(),
            "Unit": soldier.unit.short_name,
            "Birth Month": soldier.birth_month,
        }

        # Get latest occurence of evaluation for each eval type passed in API call
        for eval_type in desired_evaluation_types:
            soldier_evaluations = DA_7817.objects.filter(
                soldier=soldier,
                event_type__type=OldEventType.Evaluation,
                evaluation_type__type=eval_type,
                date__range=(start_date, end_date),
            ).order_by("-date")

            # If there are any evals for this soldier w/ applied filters
            if soldier_evaluations.exists():
                if data.get("recent_vs_count") == "recent":
                    most_recent = soldier_evaluations.first()
                    current_data[eval_type] = (
                        most_recent.date if most_recent.go_nogo == EvaluationResult.GO else "No-Go"
                    )
                else:
                    passed_evals = soldier_evaluations.filter(go_nogo=EvaluationResult.GO)
                    current_data[eval_type] = passed_evals.count()
            else:
                current_data[eval_type] = None if data.get("recent_vs_count") == "recent" else 0

        # Get latest occurence of training for each training passed in API call
        for training_type in desired_training_types:
            soldier_trainings = DA_7817.objects.filter(
                soldier=soldier,
                event_type__type=OldEventType.Training,
                training_type__type=training_type,
                date__range=(start_date, end_date),
            ).order_by("-date")

            if soldier_trainings.exists():
                if data.get("recent_vs_count") == "recent":
                    most_recent = soldier_trainings.first()
                    current_data[training_type] = (
                        most_recent.date if most_recent.go_nogo != EvaluationResult.NOGO else "No-Go"
                    )
                else:
                    passed_trainings = soldier_trainings.exclude(go_nogo=EvaluationResult.NOGO)
                    current_data[training_type] = passed_trainings.count()
            else:
                current_data[training_type] = None if data.get("recent_vs_count") == "recent" else 0

        # Get latest occurence of task completion for each task passed in API call
        for task_number in desired_task_numbers:
            task_completion = EventTasks.objects.filter(
                event__soldier=soldier,
                task__task_number=task_number,
                event__date__range=(start_date, end_date),
            ).order_by("-event__date")

            if task_completion.exists():
                if data.get("recent_vs_count") == "recent":
                    most_recent = task_completion.first()
                    current_data[most_recent.task.task_number] = (
                        most_recent.event.date if most_recent.event.go_nogo != EvaluationResult.NOGO else "No-Go"
                    )
                else:
                    task_completions = task_completion.exclude(event__go_nogo=EvaluationResult.NOGO)
                    current_data[task_number] = task_completions.count()
            else:
                current_data[task_number] = None if data.get("recent_vs_count") == "recent" else 0

        return_data.append(current_data)

    return JsonResponse(return_data, safe=False)
