from django.http import HttpRequest, HttpResponse, HttpResponseServerError, JsonResponse, HttpResponseNotFound
from django.views import View
import json

from auto_dsr.models import Unit, User, UserRole
from auto_dsr.model_utils import UserRoleAccessLevel

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_NO_USER_ROLE,
)


class UserRoleViews(View):
    """
    Defines views related to User Roles in the Auto DSR application
    """

    def get(self, request: HttpRequest, user_id: str):
        """
        For a given user, returns all units the user has an elevated role in and
        what that role is

        @param self:
        @param request: django.http.HttpRequest the request object
        @param user_id: str the DOD ID number for the user to get roles for
        """
        user_roles = UserRole.objects.filter(user_id=user_id)
        elevated_user_roles = user_roles.exclude(access_level=UserRoleAccessLevel.READ)
        role_values = elevated_user_roles.values("unit", "access_level")

        return JsonResponse({"roles": list(role_values)})

    def post(self, request: HttpRequest, user_id: str):
        """
        Given information about a user and a unit, create the designated role.
        Note, if no user exists, a new user is created (and the appropriate JSON fields must be included)

        @param self:
        @param request: django.http.HttpRequest the request object
        @param user_id: str the DOD ID number to create a new role for
        """
        body_unicode = request.body.decode("utf-8")
        new_role = json.loads(body_unicode)

        # Check for the user role update

        try:  # to get the Unit to add a role to
            new_role_unit = Unit.objects.get(uic=new_role["uic"])
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
                unit=new_role_unit,
                is_admin=new_role["is_admin"],
            )
            user.save()

        try:  # update user role for an existing user
            user_role = UserRole.objects.get(user_id=user_id, unit=new_role_unit)
            user_role.access_level = UserRoleAccessLevel[new_role.get("access_level").upper()]
            user_role.save()
        except UserRole.DoesNotExist:
            try:
                UserRole(
                    user_id=user,
                    unit=new_role_unit,
                    access_level=UserRoleAccessLevel[new_role.get("access_level").upper()],
                ).save()
            except:
                return HttpResponseServerError("Failed to create role for user")

        return HttpResponse("Created new role for user")

    def delete(self, request: HttpRequest, user_id: str):
        """
        Given information about a user and a unit, delete existing roles

        @param self:
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
