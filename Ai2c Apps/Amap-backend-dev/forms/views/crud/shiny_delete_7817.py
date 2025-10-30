from django.http import HttpRequest, HttpResponse, HttpResponseServerError
from django.views.decorators.http import require_http_methods

from forms.models import Event, EventTasks
from personnel.models import Soldier
from personnel.utils import get_soldier_mos_ml
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_7817_NOT_FOUND,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
)


@require_http_methods(["DELETE"])
def shiny_delete_7817(request: HttpRequest, event_id: int):
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = Soldier.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except Soldier.DoesNotExist:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    try:
        event = Event.objects.get(id=event_id)
        event.event_deleted = True
        event._history_user = user
        event.save()
        # Delete associated event tasks
        event_tasks = EventTasks.objects.filter(event=event)
        event_tasks.delete()

        # Update the event soldier's reporting ML
        event.soldier.reporting_ml = get_soldier_mos_ml(event.soldier)
        event.soldier.save()

    except (Event.DoesNotExist, ValueError):
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_7817_NOT_FOUND)

    return HttpResponse("DA-7817 Deleted Successfully")
