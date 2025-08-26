from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.db.models import Value as V, Case, When, CharField
from django.db.models.functions import Concat
from django.views.decorators.http import require_GET

from personnel.models import Soldier
from forms.models import DA_7817, EventTasks, SupportingDocument, DA_4856

from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST
from utils.logging import log_api_call


@require_GET
def shiny_get_soldier_da_7817s(request: HttpRequest, user_id: str):
    """
    Given a soldiers user_id, return all of thier DA7817 records
    """
    try:  # to get the soldier requested
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)
    da_7817s = (
        DA_7817.objects.filter(soldier=soldier, event_deleted=False)
        .annotate(
            recorded_by_name=Concat(
                "recorded_by_id__rank", V(" "), "recorded_by_id__first_name", V(" "), "recorded_by_id__last_name"
            )
        )
        .annotate(
            recorded_by_non_legacy=Case(
                When(recorded_by_name="  ", then=V(None, output_field=CharField())), default="recorded_by_name"
            )
        )
    )

    da_7817_info = [
        "id",
        "soldier_id",
        "date",
        "uic_id",
        "event_type__type",
        "training_type__type",
        "evaluation_type__type",
        "go_nogo",
        "gaining_unit_id",
        "tcs_location__abbreviation",
        "award_type__type",
        "total_mx_hours",
        "comment",
        "maintenance_level",
        "recorded_by_legacy",
        "recorded_by_id",
        "recorded_by_non_legacy",
        "attached_da_4856_id",
        "event_deleted",
        "mos__mos",
    ]

    da_7817_events = list(da_7817s.values(*da_7817_info))
    for event in da_7817_events:
        event["event_tasks"] = get_list_of_tasks(event["id"])
        event["has_associations"] = (
            event["attached_da_4856_id"] != None
            or SupportingDocument.objects.filter(related_event__id=event["id"]).exists()
        )

    return JsonResponse({"da_7817s": da_7817_events})


def get_list_of_tasks(da7817_id: int):
    tasks = []
    event = DA_7817.objects.get(id=da7817_id)
    event_tasks = EventTasks.objects.filter(event=event)
    for event_task in event_tasks:
        tasks.append(event_task.task.task_number)
    return tasks
