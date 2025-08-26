from django.http import (
    HttpResponse,
    HttpRequest,
    HttpResponseBadRequest,
    HttpResponseNotFound,
)
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from forms.models import DA_4856, DA_7817
from personnel.models import Soldier

from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_DA7817_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
)
from utils.logging import log_api_call


@csrf_exempt
@require_POST
@log_api_call
def shiny_add_4856(request: HttpRequest, soldier_id: str, form_title: str, da_7817_id: str, date: str):
    """
    Creates a new 4856 Form

    @param soldier_id: (str) the User ID of the soldier that the 4856 Form is being created for
    @param form_title: (str) the title of the 4856 Form being created
    @param da_7817_id: (str) the primary key of the 7817 From this 4856 form is to be attached to (if any)
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

    if da_7817_id != "NA":
        try:
            da_7817 = DA_7817.objects.get(id=da_7817_id)
        except DA_7817.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_DA7817_DOES_NOT_EXIST)

        da_7817.attached_da_4856 = da_4856
        da_7817._history_user = uploading_soldier
        da_7817.save()

    return HttpResponse("DA 4856 {} sucessfully created.".format(form_title))
