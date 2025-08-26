from django.http import HttpRequest, HttpResponseNotFound, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

from forms.models import SupportingDocument, SupportingDocumentType, DA_7817
from personnel.models import Soldier

from utils.http.constants import (
    HTTP_404_DA7817_DOES_NOT_EXIST,
    HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST,
    HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
)
from utils.logging import log_api_call


@csrf_exempt
@log_api_call
@require_http_methods(["PUT"])
def update_supporting_document(request: HttpRequest, supporting_doc_id: str):
    """
    Updates an existing Supporting Document dependent on the input data; the data should be embedded in the request body as follows.

    @param request: (HttpRequest)
    @param supporting_doc_id: (int) The id of the Supporting Document to be updated
    @request body: (json)
        {
            "document_type": (SupportDocumentType | None) The support document's new type
            "visible_to_user": (bool | None) Updating if the Support Document will be visible for user's or not
            "related_event": (str | None) The id of the support document's new related DA 7817
        }

    @returns (HttpResponse | HttpResponseNotFound)
    """
    data: dict = json.loads(request.body)

    try:
        uploading_soldier = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    try:
        support_doc = SupportingDocument.objects.get(id=supporting_doc_id)
    except SupportingDocument.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST)

    if data.get("document_type", None):
        try:
            supporting_doc_type = SupportingDocumentType.objects.get(type=data["document_type"])
        except SupportingDocumentType.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST)

        support_doc.document_type = supporting_doc_type

    if data.get("related_event", None):
        try:
            da_7817 = DA_7817.objects.get(id=data["related_event"])
        except DA_7817.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_DA7817_DOES_NOT_EXIST)

        support_doc.related_event = da_7817

    support_doc.visible_to_user = data.get("visible_to_user", support_doc.visible_to_user)
    support_doc.uploaded_by = uploading_soldier

    fields = list(data.keys()).append("uploaded_by")
    support_doc._history_user = uploading_soldier
    support_doc.save(update_fields=fields)

    return HttpResponse("Supporting Document {} updated.".format(support_doc.document_title))
