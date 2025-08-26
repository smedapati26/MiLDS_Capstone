from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from personnel.models import Soldier
from forms.models import SupportingDocument

from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST
from utils.logging import log_api_call


@require_GET
def shiny_get_soldier_supporting_documents(request: HttpRequest, user_id: str):
    """
    Returns all SupportingDocument objects
    """
    try:  # to get the soldier requested
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    supporting_docs = SupportingDocument.objects.filter(soldier=soldier)

    return_data = []

    for support_doc in supporting_docs:
        return_data.append(
            {
                "id": support_doc.id,
                "uploaded_by": None if support_doc.uploaded_by == None else support_doc.uploaded_by.user_id,
                "uploaded_by_name": (
                    None if support_doc.uploaded_by == None else support_doc.uploaded_by.name_and_rank()
                ),
                "upload_date": support_doc.upload_date,
                "document": support_doc.document != "",
                "document_date": support_doc.document_date,
                "document_title": support_doc.document_title,
                "document_type": None if support_doc.document_type == None else support_doc.document_type.type,
                "related_event": None if support_doc.related_event == None else support_doc.related_event.id,
                "visible_to_user": support_doc.visible_to_user,
            }
        )

    return JsonResponse({"supporting_documents": return_data})
