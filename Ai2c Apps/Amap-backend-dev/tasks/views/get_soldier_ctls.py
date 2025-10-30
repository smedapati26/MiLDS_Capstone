import json

from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from personnel.models import Soldier
from personnel.utils import get_soldier_uctl_and_ictl_dataframes
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST


@require_GET
def get_soldier_ctls(request: HttpRequest, user_id: str):
    """
    Returns all Soldier UCTL and ICTL DFs
    """
    try:  # to get the soldier requested
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    soldier_ictl, soldier_uctl = get_soldier_uctl_and_ictl_dataframes(soldier)

    if len(soldier_ictl) > 0:
        ictl = json.loads(soldier_ictl.to_json(orient="records"))
    else:
        ictl = []

    if len(soldier_uctl) > 0:
        uctl = json.loads(soldier_uctl.to_json(orient="records"))
    else:
        uctl = []

    return JsonResponse(
        {
            "soldier_ictl": ictl,
            "soldier_uctl": uctl,
        }
    )
