import json

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from auto_dsr.models import Unit, User, UserRole
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_NO_USER_ROLE,
)


@require_http_methods(["DELETE"])
def delete_user_role(request: HttpRequest, user_id: str):
    """
    Given information about a user and a unit, delete existing roles

    @param request: django.http.HttpRequest the request object
    @param user_id: str the DOD ID number for the user whose role to remove
    """
    body_unicode = request.body.decode("utf-8")
    remove_role = json.loads(body_unicode)

    try:  # to get the Unit to remove elevated access to
        unit = Unit.objects.get(uic=remove_role["uic"])
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:  # to get the user to remove the role for
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    try:  # to get the role to remove
        user_role = UserRole.objects.get(user_id=user, unit=unit)
    except UserRole.DoesNotExist:
        return HttpResponseNotFound(HTTP_NO_USER_ROLE)

    user_role.delete()

    return HttpResponse("Removed user access to unit")
