from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from forms.models import DA_4856
from personnel.models import Soldier
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST


@require_GET
def shiny_get_soldier_da_4856s(request: HttpRequest, user_id: str):
    """
    Returns all DA_4856 objects
    """
    try:  # to get the soldier requested
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    da_4856s = DA_4856.objects.filter(soldier=soldier, visible_to_user=True)

    return_data = []

    for counseling in da_4856s:
        return_data.append(
            {
                "id": counseling.id,
                "date": counseling.date,
                "title": counseling.title,
                "uploaded_by": None if counseling.uploaded_by == None else counseling.uploaded_by.user_id,
                "uploaded_by_name": None if counseling.uploaded_by == None else counseling.uploaded_by.name_and_rank(),
            }
        )

    return JsonResponse({"da_4856s": return_data})
