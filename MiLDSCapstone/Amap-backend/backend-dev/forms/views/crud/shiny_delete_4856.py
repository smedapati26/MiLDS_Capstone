from django.views.decorators.http import require_http_methods
from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, HttpResponseBadRequest

from forms.models import DA_4856, DA_7817
from personnel.models import Soldier

from utils.http.constants import (
    HTTP_404_DA4856_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
)
from utils.logging import log_api_call


@log_api_call
@require_http_methods(["DELETE"])
def shiny_delete_4856(request: HttpRequest, da_4856_id: int):
    """
    View for soft deleting an existing DA 4856 object.

    @param request: (HttpRequest) The request object
    @param da_4856_id: (int) The primary key of the DA 4856 object being 'deleted'

    @returns (HttpResponse | HttpResponseNotFound)
    """
    try:
        delete_soldier = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except:
        delete_soldier = None

    try:
        da_4856 = DA_4856.objects.get(id=da_4856_id)
    except DA_4856.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_DA4856_DOES_NOT_EXIST)

    # Remove 4856 from any 7817s to which it is associated so that users
    # can replace with a new counseling
    associated_7817s = DA_7817.objects.filter(attached_da_4856=da_4856)
    for event in associated_7817s:
        event.attached_da_4856 = None

    da_4856.visible_to_user = False
    da_4856._history_user = delete_soldier
    da_4856.save()

    return HttpResponse("DA4856 ({}) removed from User's view.".format(da_4856.title))
