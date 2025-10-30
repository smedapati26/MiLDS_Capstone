from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_POST

from forms.models import DA_4856, Event
from personnel.models import Soldier
from utils.http.constants import (
    HTTP_404_DA7817_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
)


@require_POST
def shiny_add_4856(request: HttpRequest, soldier_id: str, form_title: str, event_id: str, date: str):
    """
    Creates a new 4856 Form

    @param soldier_id: (str) the User ID of the soldier that the 4856 Form is being created for
    @param form_title: (str) the title of the 4856 Form being created
    @param event_id: (str) the primary key of the 7817 From this 4856 form is to be attached to (if any)
                             if there is no 7817, then NA should be passed.
    @param date: (str) ISO formatted date string
    @param request: (django.http.HttpRequest) the request object
        - The body MUST be the pdf document of the 4856 and the key must be the equal to the form_title in the url.
    """
    try:
        uploading_soldier = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    try:
        soldier = Soldier.objects.get(user_id=soldier_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    da_4856 = DA_4856.objects.create(date=date, soldier=soldier, title=form_title, uploaded_by=uploading_soldier)
    da_4856.document = request.FILES["pdf"]
    da_4856._history_user = uploading_soldier
    da_4856.save()

    if event_id != "NA":
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_DA7817_DOES_NOT_EXIST)

        event.attached_da_4856 = da_4856
        event._history_user = uploading_soldier
        event.save()

    return HttpResponse("DA 4856 {} successfully created.".format(form_title))
