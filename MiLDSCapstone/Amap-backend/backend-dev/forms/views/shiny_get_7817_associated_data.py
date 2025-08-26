from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from forms.models import DA_7817, SupportingDocument

from utils.http.constants import HTTP_404_DA7817_DOES_NOT_EXIST
from utils.logging import log_api_call


@require_GET
@log_api_call
def shiny_get_7817_associated_data(request: HttpRequest, da_7817_id: int):
    """
    Returns all Associated Data (DA 4856 Counselings and/or Supporting Document objects) for a DA 7817 event.
    """
    try:  # to get the 7817 requested
        da_7817 = DA_7817.objects.get(id=da_7817_id)
    except DA_7817.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_DA7817_DOES_NOT_EXIST)

    return_data = {"associated_counselings": [], "associated_supporting_docs": []}

    if da_7817.attached_da_4856 != None:
        return_data["associated_counselings"] = {
            "id": da_7817.attached_da_4856.id,
            "title": da_7817.attached_da_4856.title,
        }

    supporting_docs = SupportingDocument.objects.filter(related_event=da_7817, visible_to_user=True)

    if supporting_docs.exists():
        return_data["associated_supporting_docs"] = [
            {"id": doc.id, "type": doc.document_type.type, "title": doc.document_title} for doc in supporting_docs
        ]

    return JsonResponse(return_data, safe=False)
