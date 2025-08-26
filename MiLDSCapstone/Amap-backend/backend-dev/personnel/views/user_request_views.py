from django.db.models import Value as V
from django.db.models.functions import Concat
from django.http import (
    HttpRequest,
    HttpResponse,
    JsonResponse,
    HttpResponseServerError,
    HttpResponseNotFound,
)
from django.utils.decorators import method_decorator
from django.views import View
import json

from personnel.models import Unit, Soldier, UserRole, UserRequest
from personnel.model_utils import UserRoleAccessLevel
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_404_REQUEST_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
)
from utils.logging import log_api_call


class UserRequestViews(View):
    """
    Defines views related to viewing, granting and denying user requests for elevated permissions
    """

    @method_decorator(log_api_call)
    def get(self, request: HttpRequest):
        """
        Returns all open user access requests the requesting user has the authority to adjudicate

        @param request: django.http.HttpRequest the request object
        """
        current_user_id = request.META.get("HTTP_X_ON_BEHALF_OF")
        if current_user_id is None:
            return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
        try:
            current_user = Soldier.objects.get(user_id=current_user_id)
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

        if current_user.is_admin:
            access_requests = UserRequest.objects.all()
        else:
            users_roles = UserRole.objects.filter(user_id=current_user)
            elevated_user_roles = users_roles.exclude(
                access_level__in=[UserRoleAccessLevel.VIEWER, UserRoleAccessLevel.EVALUATOR]
            )
            users_units = []
            for role in elevated_user_roles:
                users_units.extend([role.unit.uic, *role.unit.subordinate_uics])
            access_requests = UserRequest.objects.filter(uic__in=users_units)

        access_request_values = access_requests.annotate(
            name=Concat(
                "user_id__rank",
                V(" "),
                "user_id__first_name",
                V(" "),
                "user_id__last_name",
            )
        ).values("user_id", "name", "uic__short_name", "access_level")
        return JsonResponse({"requests": list(access_request_values)})

    @method_decorator(log_api_call)
    def post(self, request: HttpRequest):
        """
        Creates a new user elevated access request

        @param request: django.http.HttpRequest the request object
        """
        body_unicode = request.body.decode("utf-8")
        user_request = json.loads(body_unicode)

        try:
            user = Soldier.objects.get(user_id=user_request.get("user_id"))
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

        try:
            unit = Unit.objects.get(uic=user_request.get("uic"))
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

        UserRequest(
            user_id=user,
            uic=unit,
            access_level=UserRoleAccessLevel[user_request.get("access_level").upper()],
        ).save()

        return HttpResponse("Created Access Request")

    @method_decorator(log_api_call)
    def put(self, request: HttpRequest):
        """
        Adjudicates a user access request

        @param request: django.http.HttpRequest the request object
        """
        body_unicode = request.body.decode("utf-8")
        user_request = json.loads(body_unicode)

        try:
            user = Soldier.objects.get(user_id=user_request.get("user_id"))
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

        try:
            unit = Unit.objects.get(uic=user_request.get("uic"))
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

        try:
            access_request = UserRequest.objects.get(user_id=user, uic=unit)
        except UserRequest.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_REQUEST_DOES_NOT_EXIST)

        if user_request.get("grant"):
            try:
                role = UserRole.objects.get(user_id=user, unit=unit)
                role.access_level = access_request.access_level
            except UserRole.DoesNotExist:
                role = UserRole(user_id=user, unit=unit, access_level=access_request.access_level)
            role.save()

        # If should not grant, or if role successfully created, delete the request
        access_request.delete()

        return HttpResponse("Adjudicated request")
