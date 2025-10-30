import json

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from forms.models import DA_4856
from personnel.models import Soldier
from utils.http.constants import (
    HTTP_404_DA4856_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
)


@require_http_methods(["PUT"])
def shiny_update_4856(request: HttpRequest, da_4856_id: int):
    """
    View for updating an existing DA 4856 object.

    @param request: (HttpRequest) The request object
    @param da_4856_id: (int) The primary key of the DA 4856 object being edited
        - The body of the PUT request must be formatted as follows:
            {
            "date": (str) The new date string for the DA 4856
            "title": (str) The new title for the DA 4856
            }

    @returns (HttpResponse | HttpResponseNotFound)
    """
    data = dict(json.loads(request.body))

    try:
        uploading_soldier = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    try:
        da_4856 = DA_4856.objects.get(id=da_4856_id)
    except DA_4856.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_DA4856_DOES_NOT_EXIST)

    da_4856.uploaded_by = uploading_soldier
    da_4856.date = data.get("date", da_4856.date)
    da_4856.title = data.get("title", da_4856.title)

    fields = list(data.keys()).append("uploaded_by")
    da_4856._history_user = uploading_soldier
    da_4856.save(update_fields=fields)

    return HttpResponse("DA 4856 successfully updated.")
