from django.http import HttpResponse, HttpResponseServerError, HttpRequest
from django.views.decorators.http import require_http_methods

from forms.models import DA_7817, EventTasks
from personnel.models import Soldier

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_7817_NOT_FOUND,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
)
from utils.logging import log_api_call


@require_http_methods(["DELETE"])
@log_api_call
def shiny_delete_7817(request: HttpRequest, da_7817_id: int):
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = Soldier.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except Soldier.DoesNotExist:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    try:
        da_7817 = DA_7817.objects.get(id=da_7817_id)
        da_7817.event_deleted = True
        da_7817._history_user = user
        da_7817.save()
        # Delete associated event tasks
        event_tasks = EventTasks.objects.filter(event=da_7817)
        event_tasks.delete()
    except (DA_7817.DoesNotExist, ValueError):
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_7817_NOT_FOUND)

    return HttpResponse("DA-7817 Deleted Successfully")
