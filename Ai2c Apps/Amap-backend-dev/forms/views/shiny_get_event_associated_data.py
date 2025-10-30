from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from forms.models import Event, SupportingDocument
from utils.http.constants import HTTP_404_DA7817_DOES_NOT_EXIST


@require_GET
def shiny_get_event_associated_data(request: HttpRequest, event_id: int):
    """
    Returns all Associated Data (DA 4856 Counselings and/or Supporting Document objects) for a DA 7817 event.
    """
    try:  # to get the Event requested
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_DA7817_DOES_NOT_EXIST)

    return_data = {"associated_counselings": [], "associated_supporting_docs": []}

    if event.attached_da_4856 != None:
        return_data["associated_counselings"] = {
            "id": event.attached_da_4856.id,
            "title": event.attached_da_4856.title,
        }

    supporting_docs = SupportingDocument.objects.filter(related_event=event, visible_to_user=True)

    if supporting_docs.exists():
        return_data["associated_supporting_docs"] = [
            {"id": doc.id, "type": doc.document_type.type, "title": doc.document_title} for doc in supporting_docs
        ]

    return JsonResponse(return_data, safe=False)
