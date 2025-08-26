from django.http import HttpRequest, JsonResponse

from forms.models import SupportingDocumentType

from utils.logging import log_api_call


@log_api_call
def get_all_supporting_document_types(request: HttpRequest):
    """
    Retrieves all the existing Supporting Document Types

    @param request: (HttpRequet)

    @returns (JsonResponse)
    """

    return_data = list(SupportingDocumentType.objects.all().values_list("type", flat=True))

    return JsonResponse({"supporting_document_types": return_data}, safe=False)
