import json
from http import HTTPStatus

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from auto_dsr.models import TaskForce, Unit
from utils.http import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@require_http_methods(["PUT"])
def update_unit(request: HttpRequest, uic: str) -> HttpResponse | JsonResponse:
    """
    Edit a Unit identified by its uic.

    - Allows editing start_date and end_date if the unit is a Task Force (UIC starts with "TF").
    - Ensures the uniqueness of short_name and display_name.
    """

    # Attempt to retrieve the requested Unit using the provided uic.
    # If the unit doesn't exist, raise a 404 Not Found error.
    try:
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST}, status=HTTPStatus.NOT_FOUND)
    data = json.loads(request.body)

    short_name = data.get("short_name", None)
    display_name = data.get("display_name", None)
    unit.nick_name = data.get("nick_name", unit.nick_name)
    echelon = data.get("echelon", None)
    parent_uic = data.get("parent_uic", None)
    readiness_uic = data.get("readiness_uic", None)
    start_date = data.get("start_date", None)
    end_date = data.get("end_date", None)

    if short_name:
        if Unit.objects.exclude(uic=unit.uic).filter(short_name=short_name).exists():
            return JsonResponse({"short_name": "short_name must be unique."}, status=HTTPStatus.BAD_REQUEST)
        unit.short_name = short_name

    if display_name:
        if Unit.objects.exclude(uic=unit.uic).filter(display_name=display_name).exists():
            return JsonResponse({"display_name": "display_name must be unique."}, status=HTTPStatus.BAD_REQUEST)
        unit.display_name = display_name

    if echelon:
        unit.echelon = echelon

    if parent_uic:
        if not Unit.objects.filter(uic=parent_uic).exists():
            return JsonResponse({"error": "Parent Unit not a valid unit"}, status=HTTPStatus.NOT_FOUND)
        unit.parent_uic = Unit.objects.get(uic=parent_uic)
        unit.set_all_unit_lists()
        for uic in unit.parent_uics:
            Unit.objects.get(uic=uic).set_all_unit_lists()

    unit.save()
    unit.set_all_unit_lists()

    if unit.uic.startswith("TF"):
        tf = TaskForce.objects.get(uic=unit)
        if not start_date or not end_date:
            return JsonResponse(
                {"error": "start_date and end_date are required for Task Forces."}, status=HTTPStatus.BAD_REQUEST
            )
        tf.start_date = data["start_date"]
        tf.end_date = data["end_date"]

        if readiness_uic:
            if not Unit.objects.filter(uic=readiness_uic).exists():
                return JsonResponse({"error": "Readiness Unit not a valid unit"}, status=HTTPStatus.NOT_FOUND)
            tf.readiness_uic = Unit.objects.get(uic=readiness_uic)
        tf.save()

    return HttpResponse("Updated Unit Data")
