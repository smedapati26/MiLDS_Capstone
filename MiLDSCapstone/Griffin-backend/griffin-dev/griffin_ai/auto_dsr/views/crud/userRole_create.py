from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, HttpResponseServerError
from django.views.decorators.http import require_http_methods
import json

from auto_dsr.models import Unit, User, UserRole
from auto_dsr.model_utils import UserRoleAccessLevel

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def create_user_role(request: HttpRequest, user_id: str):
    """
    Given information about a user and a unit, create the designated role.
    Note, if no user exists, a new user is created (and the appropriate JSON fields must be included)

    @param request: django.http.HttpRequest the request object
    @param user_id: str the DOD ID number to create a new role for
    """
    body_unicode = request.body.decode("utf-8")
    new_role = json.loads(body_unicode)

    try:  # to get the Unit to add a role to
        unit = Unit.objects.get(uic=new_role["uic"])
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:  # to get the User object
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        user = User(
            user_id=user_id,
            rank=new_role["rank"],
            first_name=new_role["first_name"],
            last_name=new_role["last_name"],
            unit=unit,
            is_admin=new_role["is_admin"],
        )
        user.save()

    try:  # to get the role object (in case a user already has a role in this unit)
        role = UserRole.objects.get(user_id=user, unit=unit)
    except UserRole.DoesNotExist:
        role = UserRole(user_id=user, unit=unit)

    try:  # to set the access_level for the role
        role.access_level = UserRoleAccessLevel[new_role.get("access_level").upper()]
        role.save()
    except:
        return HttpResponseServerError("Failed to create role for user")

    return HttpResponse("Created new role for user")
