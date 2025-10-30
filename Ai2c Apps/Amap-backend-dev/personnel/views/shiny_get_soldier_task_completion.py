import json

import pandas as pd
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from forms.models import Event, EventTasks
from personnel.models import Soldier
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST


@require_GET
def shiny_get_soldier_task_completion(request: HttpRequest, user_id: str):
    """
    Given a user_id for a requested soldier, returns a json object which contains the
    tasks number, the date that task was most recently completed, and whether the task was
    completed during a training or evaluation event
    """
    try:  # to get the soldier requested
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    # Get soldier's DA7817 events
    soldier_events = Event.objects.filter(soldier=soldier.user_id)

    # Get the completed tasks from a soldier's event record
    soldier_completed_tasks = EventTasks.objects.filter(event__in=soldier_events)

    task_completion_info = ["task", "event__date", "event__event_type__type"]

    # Convert to pandas df for filtering to most recent task completion
    task_completion_df = pd.DataFrame(list(soldier_completed_tasks.values(*task_completion_info)))
    # if soldier has not completed any tasks
    if task_completion_df.empty:
        return JsonResponse({"soldier_completed_tasks": json.loads(task_completion_df.to_json(orient="records"))})

    task_completion_df["event__date"] = pd.to_datetime(task_completion_df["event__date"])
    recent_task_df = task_completion_df.loc[task_completion_df.groupby("task")["event__date"].idxmax()]
    recent_task_df["event__date"] = recent_task_df["event__date"].astype(str)

    recent_task_df.columns = ["task_number", "most_recent_date", "training_or_eval"]

    return JsonResponse({"soldier_completed_tasks": json.loads(recent_task_df.to_json(orient="records"))})
