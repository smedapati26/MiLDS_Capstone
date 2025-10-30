from django.http import HttpRequest, HttpResponse
from django.views.decorators.http import require_GET

from personnel.models import Soldier
from tasks.models import Ictl
from utils.http.constants import HTTP_200_UCTL_SUPERCEDED, HTTP_404_ICTL_DOES_NOT_EXIST


@require_GET
def shiny_supercede_uctl(request: HttpRequest, uctl_id: int):
    """
    Supercede Unit Critical Task List
    """
    try:
        updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except:
        updated_by = None

    try:
        uctl = Ictl.objects.get(ictl_id=uctl_id)
    except Ictl.DoesNotExist:
        return HttpResponse(HTTP_404_ICTL_DOES_NOT_EXIST)

    uctl.status = "Superceded"
    uctl._history_user = updated_by
    uctl.save()

    return HttpResponse(HTTP_200_UCTL_SUPERCEDED)
