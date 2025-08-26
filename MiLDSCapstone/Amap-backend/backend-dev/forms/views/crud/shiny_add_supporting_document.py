from datetime import date
from django.http import HttpRequest, HttpResponseNotFound, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from forms.models import DA_7817, SupportingDocument, SupportingDocumentType
from personnel.models import Soldier

from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_DA7817_DOES_NOT_EXIST,
    HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_FILES_NOT_FORMATTED_PROPERLY,
)
from utils.logging import log_api_call


@csrf_exempt
@log_api_call
@require_http_methods(["POST"])
def add_supporting_document(
    request: HttpRequest, soldier_id: str, document_title: str, document_type: str, document_date: str, da_7817_id: str
):
    """
    Creates a new Supporting Document dependent on the input data.

    @param request: (HttpRequest)
    @param soldier_id: (str) The DoD ID of the solider the supporting document is created for
    @param document_title: (str) The title of the supporting document
    @param document_type: (SupportingDocumentType) The type of supporting document being created
    @param document_date: (str) The date that the document was valid/created passed in ISO formatting
    @param da_7817_id: (str | "None") The id of the DA 7817 object that is attached/related to the supporting document; needs to be "None" if there is no associated DA 7817

    @returns (HttpResponse | HttpResponseNotFound)
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

    if da_7817_id != "None":
        try:
            da_7817 = DA_7817.objects.get(id=da_7817_id)
        except DA_7817.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_DA7817_DOES_NOT_EXIST)
    else:
        da_7817 = None

    try:
        supporting_doc_type = SupportingDocumentType.objects.get(type=document_type)
    except SupportingDocumentType.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST)

    upload_date = date.today()

    try:
        supporting_document = request.FILES["file"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_FILES_NOT_FORMATTED_PROPERLY)

    new_supporting_doc = SupportingDocument.objects.create(
        soldier=soldier,
        uploaded_by=uploading_soldier,
        upload_date=upload_date,
        document_date=document_date,
        document_title=document_title,
        document_type=supporting_doc_type,
        related_event=da_7817,
    )

    new_supporting_doc.document = supporting_document
    new_supporting_doc._history_user = uploading_soldier
    new_supporting_doc.save()

    return HttpResponse("Supporting Document {} created successfully.".format(new_supporting_doc.document_title))
