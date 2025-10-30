from datetime import date

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from forms.models import Event, SupportingDocument, SupportingDocumentType
from personnel.models import Soldier, SoldierDesignation
from utils.http.constants import (
    HTTP_404_DA7817_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DESIGNATION_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_FILES_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def add_supporting_document(
    request: HttpRequest,
    soldier_id: str,
    document_title: str,
    document_type: str,
    document_date: str,
    event_id: str,
    soldier_designation_id: str,
):
    """
    Creates a new Supporting Document dependent on the input data.

    @param request: (HttpRequest)
    @param soldier_id: (str) The DoD ID of the solider the supporting document is created for
    @param document_title: (str) The title of the supporting document
    @param document_type: (SupportingDocumentType) The type of supporting document being created
    @param document_date: (str) The date that the document was valid/created passed in ISO formatting
    @param event_id: (int | "None") The id of the Event object that is attached/related to the supporting document; needs to be "None" if there is no associated Event
    @param soldier_designation_id: (int | "None") The id of the Soldier Designation (TI, AE) that is related to the supporting document; needs to be "None" if
    there is no associated Soldier Designation

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

    # If event id is passed, associate the Supporting Document to that event
    if event_id != "None":
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_DA7817_DOES_NOT_EXIST)
    else:
        event = None

    # If Soldier Designation ID is passed, associate the supporting document to that designation
    if soldier_designation_id != "None":
        try:
            designation = SoldierDesignation.objects.get(id=soldier_designation_id)
        except SoldierDesignation.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DESIGNATION_DOES_NOT_EXIST)
    else:
        designation = None

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
        related_event=event,
        related_designation=designation,
    )

    new_supporting_doc.document = supporting_document
    new_supporting_doc._history_user = uploading_soldier
    new_supporting_doc.save()

    return HttpResponse("Supporting Document {} created successfully.".format(new_supporting_doc.document_title))
