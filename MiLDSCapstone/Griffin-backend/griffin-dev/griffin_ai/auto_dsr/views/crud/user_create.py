from django.http import HttpRequest, HttpResponse, HttpResponseServerError, HttpResponseNotFound
from django.views.decorators.http import require_POST
import json

from auto_dsr.models import Unit, User, UserRole
from auto_dsr.model_utils import UserRoleAccessLevel

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)


@require_POST
def create_user(request: HttpRequest, user_id: str):
    """
    Accepts information about a given user and creates an associated account and initial default role

    @param request: django.http.HttpRequest the request object
    @param user_id: str The user_id to create a new user for
    """
    body_unicode = request.body.decode("utf-8")
    new_user = json.loads(body_unicode)

    try:
        new_user_unit = Unit.objects.get(uic=new_user["unit"])
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:
        new_user = User(
            user_id=user_id,
            rank=new_user["rank"],
            first_name=new_user["first_name"],
            last_name=new_user["last_name"],
            unit=new_user_unit,
            is_admin=new_user["is_admin"],
        )
        new_user.save()
    except:
        return HttpResponseServerError("Failed to Create New User")

    # Admins do not need specific roles on individual units
    if not new_user.is_admin:
        try:
            UserRole(
                user_id=new_user,
                unit=new_user_unit,
                access_level=UserRoleAccessLevel.READ,
            ).save()
        except:
            return HttpResponseServerError("Failed to create new user role")

    return HttpResponse("Created New User")
