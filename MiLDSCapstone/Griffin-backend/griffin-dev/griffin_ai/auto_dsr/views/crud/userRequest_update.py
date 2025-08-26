from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, HttpResponseServerError
from django.views.decorators.http import require_http_methods
import json

from auto_dsr.models import Unit, User, UserRole, UserRequest
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)


@require_http_methods(["PUT"])
def update_user_request(request: HttpRequest):
    """
    Adjudicates a user access request

    @param request: django.http.HttpRequest the request object
    """
    body_unicode = request.body.decode("utf-8")
    user_request = json.loads(body_unicode)

    try:
        user = User.objects.get(user_id=user_request.get("user_id"))
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    try:
        unit = Unit.objects.get(uic=user_request.get("uic"))
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:
        access_request = UserRequest.objects.get(user_id=user, uic=unit)
    except UserRequest.DoesNotExist:
        return HttpResponseNotFound("No such request exists")
    except UserRequest.MultipleObjectsReturned:
        try:
            access_request = UserRequest.objects.get(
                user_id=user,
                uic=unit,
                access_level=user_request.get("access_level"),
            )
        except UserRequest.DoesNotExist:
            return HttpResponseNotFound(
                "No such request for {}, {}, and access level {} exists".format(
                    str(user), str(unit), str(user_request.get("access_level"))
                )
            )
        except UserRequest.MultipleObjectsReturned:
            return HttpResponseServerError(
                "Multiple User Requests for this Unit curretnly exist. Please contact support to help resolve this issue."
            )

    if user_request.get("grant"):
        try:
            role = UserRole.objects.get(user_id=user, unit=unit)
            role.access_level = access_request.access_level
        except UserRole.DoesNotExist:
            role = UserRole(user_id=user, unit=unit, access_level=access_request.access_level)
        except UserRequest.MultipleObjectsReturned:
            try:
                role = UserRequest.objects.get(
                    user_id=user,
                    uic=unit,
                    access_level=user_request.get("access_level"),
                )
            except UserRequest.DoesNotExist:
                return HttpResponseNotFound(
                    "No such request for {}, {}, and access level {} exists".format(
                        str(user), str(unit), str(user_request.get("access_level"))
                    )
                )
            except UserRequest.MultipleObjectsReturned:
                return HttpResponseServerError(
                    "Multiple User Requests for this Unit curretnly exist. Please contact support to help resolve this issue."
                )

        role.save()

    # If should not grant, or if role successfully created, delete the request
    access_request.delete()

    return HttpResponse("Adjudicated request")
