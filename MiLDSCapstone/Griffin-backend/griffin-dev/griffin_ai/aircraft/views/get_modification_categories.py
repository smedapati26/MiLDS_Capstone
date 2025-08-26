from django.http import HttpRequest, JsonResponse, HttpResponseNotFound

from aircraft.models import Modification, ModificationCategory
from aircraft.model_utils import ModificationTypes

from utils.http.constants import HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST


def get_modification_categories(request: HttpRequest, name: str):
    """
    Gets all of the categories available to a Modification, if it is a Categorical Modification.

    @param request: (django.http.HttpRequest)
    @param name: (str) The name of the Modification the categories are being requested for

    @return list({value: str, description:str}): Returns a list of strings representing the value and description of the categories.
    """
    try:
        modification = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    categories = list(ModificationCategory.objects.filter(modification=modification).values("value", "description"))

    return JsonResponse(categories, safe=False)
