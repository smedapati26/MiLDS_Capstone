from django.db.models import Case, CharField, F, IntegerField
from django.db.models import Value as V
from django.db.models import When
from django.db.models.functions import Cast, Coalesce, Concat, Substr
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from forms.models import Event, EventTasks, SupportingDocument
from personnel.models import Soldier
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST


@require_GET
def shiny_get_soldier_da_7817s(request: HttpRequest, user_id: str):
    """
    Given a soldiers user_id, return all of their DA7817 records
    """
    try:  # to get the soldier requested
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)
    da_7817s = (
        Event.objects.filter(soldier=soldier, event_deleted=False)
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
        # Set the name of the recorder to be displayed
        .annotate(recorder=Coalesce("recorded_by_non_legacy", "recorded_by_legacy"))
        .annotate(
            event_cont=Case(
                When(
                    event_type__type="PCS/ETS",
                    then=Concat(V("Gaining Unit - "), "gaining_unit__short_name"),
                ),
                When(
                    event_type__type="Training",
                    then="training_type__type",
                ),
                When(
                    event_type__type="Evaluation",
                    then="evaluation_type__type",
                ),
                When(
                    event_type__type="Award",
                    then="award_type__type",
                ),
                When(
                    event_type__type="TCS",
                    then="tcs_location__abbreviation",
                ),
                default=V("See Comment"),
            )
        )
        .annotate(numerical_ml=Cast(Substr(F("maintenance_level"), 3), output_field=IntegerField()))
        .order_by("-date")
    )

    da_7817_info = [
        "id",
        "soldier_id",
        "date",
        "uic_id",
        "event_type__type",
        "training_type__type",
        "evaluation_type__type",
        "tcs_location__abbreviation",
        "award_type__type",
        "gaining_unit_id",
        "go_nogo",
        "total_mx_hours",
        "comment",
        "mos__mos",
        "maintenance_level",
        "numerical_ml",
        "recorded_by_legacy",
        "recorded_by_id",
        "recorded_by_non_legacy",
        "recorder",
        "attached_da_4856_id",
        "event_deleted",
        "event_cont",
    ]

    da_7817_events = list(da_7817s.values(*da_7817_info))
    # Get unique MOS across recorded events, as well as unique mos that a soldier holds
    unique_mos = (
        set(da_7817s.exclude(mos__mos__isnull=True).values_list("mos__mos", flat=True).distinct())
        | set([soldier.primary_mos.mos] if soldier.primary_mos else [])
        | set(soldier.additional_mos.values_list("mos", flat=True))
    )
    for event in da_7817_events:
        event_tasks = get_list_of_tasks(event["id"])
        event["event_tasks"] = event_tasks
        event["comment"] = "" if event["comment"] is None else event["comment"]
        # Add Associated tasks to comment
        if len(event_tasks) > 0:
            event["comment"] = event["comment"] + ".  Associated Tasks: " + ", ".join(event_tasks)
        # Add has_association flag
        event["has_associations"] = (
            event["attached_da_4856_id"] != None
            or SupportingDocument.objects.filter(related_event__id=event["id"], visible_to_user=True).exists()
        )
        # Set MOS-ML column - if only one unique mos in soldier's profile / records will just be ML
        # If several unique mos will be MOS-ML
        if event["mos__mos"] is not None:
            if len(unique_mos) > 1:
                event["mos_ml"] = event["mos__mos"] + " - " + event["maintenance_level"]
            else:
                event["mos_ml"] = event["maintenance_level"]
        else:
            event["mos_ml"] = None

    return JsonResponse({"da_7817s": da_7817_events})


def get_list_of_tasks(da7817_id: int):
    tasks = []
    event = Event.objects.get(id=da7817_id)
    event_tasks = EventTasks.objects.filter(event=event)
    for event_task in event_tasks:
        tasks.append(event_task.task.task_number)
    return tasks
