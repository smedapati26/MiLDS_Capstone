from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from auto_dsr.models import UserSetting
from utils.http import HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST


@require_http_methods(["DELETE"])
def delete_user_setting(request: HttpRequest, user_setting_id: int):
    """
    Deletes an existing User Settings object.

    @param request: (HttpRequest)

    @returns HttpRespose | HttpResponseNotFound
    """
    try:
        user_setting = UserSetting.objects.get(id=user_setting_id)
    except UserSetting.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST)

    user_setting.delete()

    return HttpResponse("User Settings deleted!")
