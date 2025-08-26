from django.http import HttpRequest, HttpResponse, JsonResponse, HttpResponseNotFound
from django.utils.decorators import method_decorator
from django.views import View
import json

from personnel.models import Unit, Soldier, UserRole
from personnel.model_utils import UserRoleAccessLevel

from utils.http.constants import (
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_ROLE_DOES_NOT_EXIST,
)
from utils.logging import log_api_call


class UserRoleViews(View):
    """
    Defines views related to User Roles in the Personnel application
    """

    @method_decorator(log_api_call)
    def get(self, request: HttpRequest, user_id: str):
        """
        For a given user, returns all units the user has an elevated role in and
        what that role is

        @param self:
        @param request: django.http.HttpRequest the request object
        @param user_id: str the DOD ID number for the user to get roles for
        """
        user_roles = UserRole.objects.filter(user_id=user_id)
        role_values = user_roles.values("unit", "access_level")

        return JsonResponse({"roles": list(role_values)})

    @method_decorator(log_api_call)
    def post(self, request: HttpRequest, user_id: str):
        """
        Given information about a user and a unit, create the designated role.
        Note, if no user exists, a new user is created (and the appropriate JSON fields must be included)

        @param self:
        @param request: django.http.HttpRequest the request object
        @param user_id: str the DOD ID number to create a new role for
        """
        try:
            updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
        except:
            updated_by = None

        body_unicode = request.body.decode("utf-8")
        new_role = json.loads(body_unicode)

        try:  # to get the Unit to add a role to
            new_role_unit = Unit.objects.get(uic=new_role["uic"])
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

        try:  # to get the User object
            user = Soldier.objects.get(user_id=user_id)
        except Soldier.DoesNotExist:
            user = Soldier(
                user_id=user_id,
                rank=new_role["rank"],
                first_name=new_role["first_name"],
                last_name=new_role["last_name"],
                unit=new_role_unit,
                is_admin=new_role["is_admin"],
                is_maintainer=new_role["is_maintainer"],
            )
            user._history_user = updated_by
            user.save()

        # Get Existing Role for this user on the unit, or create new role
        user_role, _ = UserRole.objects.get_or_create(user_id=user, unit=new_role_unit)
        # Update user role access level
        user_role.access_level = UserRoleAccessLevel[new_role.get("access_level").upper()]
        user_role._history_user = updated_by
        user_role.save()

        return HttpResponse("Created new role for user")

    @method_decorator(log_api_call)
    def delete(self, request: HttpRequest, user_id: str):
        """
        Given information about a user and a unit, delete existing roles

        @param self:
        @param request: django.http.HttpRequest the request object
        @param user_id: str the DOD ID number for the user whose role to remove
        """
        try:
            updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
        except:
            updated_by = None

        body_unicode = request.body.decode("utf-8")
        remove_role = json.loads(body_unicode)

        try:  # to get the Unit to remove elevated access to
            unit = Unit.objects.get(uic=remove_role["uic"])
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

        try:  # to get the user to remove the role for
            user = Soldier.objects.get(user_id=user_id)
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

        try:  # to get the role to remove
            user_role = UserRole.objects.get(user_id=user, unit=unit)
        except UserRole.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_ROLE_DOES_NOT_EXIST)
        user_role._history_user = updated_by
        user_role.delete()

        return HttpResponse("Removed user access to unit")
