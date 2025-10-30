from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from forms.models import SupportingDocument
from personnel.models import Soldier
from utils.http.constants import (
    HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
)


@require_http_methods(["DELETE"])
def delete_supporting_document(request: HttpRequest, supporting_doc_id: int):
    """
    This will 'delete' the Supporting Document from a User's view by setting the visible_to_user value
    to False.

    @param request: (HttpRequest)
    @param supporting_doc_id: (int) The id of the Supporting Document to be 'deleted'

    @returns (HttpResponse | HttpResponseNotFound)
    """
    try:
        delete_soldier = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except:
        delete_soldier = None

    try:
        supporting_document = SupportingDocument.objects.get(id=supporting_doc_id)
    except SupportingDocument.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST)

    supporting_document.visible_to_user = False
    supporting_document._history_user = delete_soldier
    supporting_document.save()

    return HttpResponse("Supporting Document {} removed from User's view.".format(supporting_document.document_title))
