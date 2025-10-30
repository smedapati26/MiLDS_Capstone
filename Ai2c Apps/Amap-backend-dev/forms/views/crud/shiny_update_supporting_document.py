import json

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from forms.models import Event, SupportingDocument, SupportingDocumentType
from personnel.models import Soldier, SoldierDesignation
from utils.http.constants import (
    HTTP_404_DA7817_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DESIGNATION_DOES_NOT_EXIST,
    HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST,
    HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
)


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
            "related_event": (str | None) The id of the support document's new related Event
            "related_designation": (str | None) The id of the supporting document's new related SoldierDesignation
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
        if data["related_event"] == "NA":
            support_doc.related_event = None
        else:
            try:
                event = Event.objects.get(id=data["related_event"])
            except Event.DoesNotExist:
                return HttpResponseNotFound(HTTP_404_DA7817_DOES_NOT_EXIST)

            support_doc.related_event = event

    if data.get("related_designation", None):
        if data["related_designation"] == "NA":
            support_doc.related_designation = None
        else:
            try:
                designation = SoldierDesignation.objects.get(id=data["related_designation"])
            except Event.DoesNotExist:
                return HttpResponseNotFound(HTTP_404_SOLDIER_DESIGNATION_DOES_NOT_EXIST)

            support_doc.related_designation = designation

    support_doc.visible_to_user = data.get("visible_to_user", support_doc.visible_to_user)
    support_doc.uploaded_by = uploading_soldier

    fields = list(data.keys()).append("uploaded_by")
    support_doc._history_user = uploading_soldier
    support_doc.save(update_fields=fields)

    return HttpResponse("Supporting Document {} updated.".format(support_doc.document_title))
