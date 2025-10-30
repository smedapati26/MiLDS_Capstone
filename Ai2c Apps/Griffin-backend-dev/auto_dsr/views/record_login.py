from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.utils import timezone

from auto_dsr.models import Login, User
from utils.http.constants import HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST


def record_login(request: HttpRequest, user_id: str):
    """
    Creates a Login record to identify when a given user accessed Griffin

    @param request: django.http.HttpRequest the request object
    @param user_id: str the DOD ID number to record a user login for
    """
    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    Login(user_id=user, login_time=timezone.now()).save()

    return HttpResponse("Login Recorded for {}".format(user_id))
