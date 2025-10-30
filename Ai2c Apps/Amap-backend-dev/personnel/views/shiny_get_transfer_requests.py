from collections import defaultdict

from django.db.models import Value as V
from django.db.models.functions import Concat
from django.http import HttpRequest, HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.views.decorators.http import require_GET

from personnel.model_utils import UserRoleAccessLevel
from personnel.models import Soldier, SoldierTransferRequest, UserRole
from personnel.utils.get_unique_unit_managers import get_unique_unit_managers
from personnel.utils.transfers_to_managers import get_manager_details, map_units_to_manager_details
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_INVALID_GET_TRANSFER,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
)


@require_GET
def shiny_get_transfer_requests(request: HttpRequest, get_type: str):
    """
    Returns either:
        get_type = "pending_user_adjudication":
        - all open soldier transfer requests the current user has the authority to adjudicate
        get_type = "users_pending_requests":
        - all open soldier transfer requests for the units that the current user is an manager for

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
        transfer_requests = SoldierTransferRequest.objects.all()
        if get_type == "pending_user_adjudication":  # Requests pending user's adjudication
            unit_managers_mapping = defaultdict(list)  # Empty manager mapping
        else:
            unit_managers_mapping = map_units_to_manager_details(transfer_requests)

    else:
        user_manager_roles = UserRole.objects.filter(user_id=current_user, access_level=UserRoleAccessLevel.MANAGER)
        users_units = []
        for role in user_manager_roles:
            users_units.extend([role.unit.uic, *role.unit.subordinate_uics])
        if get_type == "pending_user_adjudication":  # Requests pending user's adjudication
            transfer_requests = SoldierTransferRequest.objects.filter(soldier__unit__uic__in=users_units)
            unit_managers_mapping = defaultdict(list)  # Empty manager mapping
        elif get_type == "users_pending_requests":  # Open requests from the user or other managers within
            # their purview for soldier transfers
            transfer_requests = SoldierTransferRequest.objects.filter(gaining_unit__uic__in=users_units)
            unit_managers_mapping = map_units_to_manager_details(transfer_requests)
        else:
            return HttpResponseServerError(HTTP_ERROR_MESSAGE_INVALID_GET_TRANSFER)

    transfer_request_values = transfer_requests.annotate(
        soldier_name=Concat("soldier__rank", V(" "), "soldier__first_name", V(" "), "soldier__last_name"),
        requester_name=Concat("requester__rank", V(" "), "requester__first_name", V(" "), "requester__last_name"),
    ).values(
        "requester_name",
        "soldier__user_id",
        "soldier__unit__uic",
        "soldier_name",
        "soldier__unit__short_name",
        "gaining_unit__short_name",
        "gaining_unit__uic",
    )

    # Populate or default 'managers' field
    transfer_requests_data = [
        {**request, "managers": unit_managers_mapping.get(request["soldier__unit__uic"], [])}
        for request in transfer_request_values
    ]

    return JsonResponse({"transfer_requests": list(transfer_requests_data)})
