from django.http import HttpRequest, JsonResponse

from aircraft.models import Message


def get_all_messages(request: HttpRequest):
    """
    Retrieves all Message objects.

    @param request (HttpRequest)

    @returns (JsonResponse) [{"number": (str), "type": (MessageTypes), "classification": (MessageClassifications),
                              "publication_date": (DateField), "compliance_date": (DateField), "confirmation_date": (DateField),
                              "contents": (str)}, {...}]
    """
    message_value_columns = [
        "number",
        "type",
        "classification",
        "publication_date",
        "compliance_date",
        "confirmation_date",
        "contents",
    ]

    all_messages = list(Message.objects.all().values(*message_value_columns))

    return JsonResponse(all_messages, safe=False)
