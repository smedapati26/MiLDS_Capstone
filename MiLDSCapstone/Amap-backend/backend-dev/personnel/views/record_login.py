from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.utils import timezone
from django.views.decorators.http import require_POST

from personnel.models import Soldier, Login

from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST
from utils.logging import log_api_call


@require_POST
@log_api_call
def record_login(request: HttpRequest, user_id: str):
    """
    Creates a Login record to identify when a given user accessed AMAP

    @param request: django.http.HttpRequest the request object
    @param user_id: str the DOD ID number to record a user login for
    """
    try:
        user = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    Login(user_id=user.user_id, login_time=timezone.now()).save()

    return HttpResponse("Login Recorded for {}".format(user_id))
