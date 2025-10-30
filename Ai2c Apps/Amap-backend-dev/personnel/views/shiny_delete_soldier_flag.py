from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from personnel.model_utils import SoldierFlagType
from personnel.models import Soldier, SoldierFlag
from utils.http.constants import (
    HTTP_404_FLAG_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
)


@require_http_methods(["DELETE"])
def shiny_delete_soldier_flag(request: HttpRequest, flag_id: int):
    """
    View for soft deleting an existing Soldier Flag object.

    @param request: (HttpRequest) The request object
    @param da_4856_id: (int) The primary key of the Soldier Flag object being 'deleted'

    @returns (HttpResponse | HttpResponseNotFound)
    """
    try:
        delete_soldier = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    try:
        flag = SoldierFlag.objects.get(id=flag_id)
    except SoldierFlag.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_FLAG_DOES_NOT_EXIST)

    flag.flag_deleted = True
    flag._history_user = delete_soldier
    flag.save()

    return HttpResponse("Soldier Flag ({}) removed from User's view.".format(flag.id))
