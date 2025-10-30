from django.http import HttpRequest, JsonResponse

from aircraft.models import AppliedModification, Modification


def get_all_modifications(request: HttpRequest):
    """
    Gets all Modifications.

    @param request (django.http.HttpRequest)

    @returns list({name: str, type: ModificationType})
    """

    all_mods = Modification.objects.all()

    return JsonResponse(list(all_mods.values("name", "type")), safe=False)
