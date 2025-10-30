from typing import List

from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router
from ninja.responses import codes_4xx

from auto_dsr.api.user_requests.schema import UserRequestIn, UserRequestOut
from auto_dsr.model_utils import Statuses
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import Unit, User, UserRequest, UserRole
from auto_dsr.utils.unit import get_subordinate_unit_uics
from auto_dsr.utils.user_permission_check import user_has_permissions_to
from notifications.models import AccessRequestNotification

user_requests_router = Router()


######## USER REQUEST ########
@user_requests_router.get("", response=List[UserRequestOut], summary="Get User Requests")
def list_user_requests(request: HttpRequest):
    """Return a list of User Requests for current user."""
    current_user = request.auth
    user_requests = UserRequest.objects.filter(user_id=current_user)
    return user_requests


######## CREATE USER REQUEST ########
@user_requests_router.post("", summary="Create User Request", response={200: dict, codes_4xx: dict})
def create_user_request(request: HttpRequest, payload: UserRequestIn):
    """
    Create a single User Request
    @param payload: dict -
        user_id: str - User ID for this request.
        uic: str - UIC of the user
        access_level: str - Requested level of access
    @return JSON object -
        success: bool
        id: int | None
    """
    pl = payload.dict()
    user = get_object_or_404(User, user_id=pl["user_id"])
    unit = get_object_or_404(Unit, uic=pl["uic"])

    try:
        user_request = UserRequest(
            user_id=user,
            uic=unit,
            access_level=UserRoleAccessLevel[pl["access_level"].upper()],
            date_created=timezone.now(),
            date_updated=timezone.now(),
        )
        user_request.save()
        AccessRequestNotification.objects.create(access_request=user_request, date_generated=timezone.now())
    except Exception:
        return 400, {"success": False, "id": None}

    return 200, {"success": True, "id": user_request.id}


######## DELETE USER REQUEST ########
@user_requests_router.delete("/{request_id}", summary="Deletes User Request", response={200: dict, codes_4xx: dict})
def delete_user_request(request: HttpRequest, request_id: int):
    """
    Delete a single user request.

    @param request_id: int - ID of the request to delete.
    @return JSON object -
        message: str - Processing result message.
    """
    current_user = request.auth
    role_request = get_object_or_404(UserRequest, id=request_id)
    if (
        user_has_permissions_to(current_user, role_request.uic, UserRoleAccessLevel.ADMIN)
        or role_request.user_id == current_user
    ):
        role_request.delete()
        role_request.id = -1
        return {"message": "User Request Deleted"}
    else:
        return 400, {"message": "Only an admin or requesting user can delete a request."}
