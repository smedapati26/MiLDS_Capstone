from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.views.decorators.http import require_GET

from forms.models import SupportingDocument
from personnel.models import Soldier, SoldierDesignation, UserRole, UserRoleAccessLevel
from units.models import Unit
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER


@require_GET
def shiny_get_soldier_designations(request: HttpRequest, specific_soldier: str):
    """
    specific_soldier = DODID of specific soldier to get designations for, or "ALL"
        if all designations in requesting soldiers manager purview to be returned

    @param request: django.http.HttpRequest the request object
    """

    current_user_id = request.headers.get("X-On-Behalf-Of", None)
    if current_user_id is None:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    try:
        requesting_user = Soldier.objects.get(user_id=current_user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    if specific_soldier == "ALL":
        if requesting_user.is_admin:
            manager_units = Unit.objects.all().values_list("uic", flat=True)
        else:
            user_manager_roles = UserRole.objects.filter(
                user_id=requesting_user, access_level=UserRoleAccessLevel.MANAGER
            )
            user_is_manager_in = Unit.objects.filter(uic__in=user_manager_roles.values_list("unit", flat=True))
            manager_units = list(user_is_manager_in.values_list("uic", flat=True))
            for unit in user_is_manager_in:
                manager_units.extend(unit.subordinate_uics)
        designations = SoldierDesignation.objects.filter(
            Q(unit__in=manager_units) | Q(soldier__unit__in=manager_units), designation_removed=False
        )

    else:
        try:
            requested_soldier = Soldier.objects.get(user_id=specific_soldier)
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)
        designations = SoldierDesignation.objects.filter(soldier=requested_soldier, designation_removed=False)

    # Annotate returned designation info to include "designation_removed" which is set based off end_date
    final_designations = []

    for designation in set(designations):
        final_designations.append(
            {
                "id": designation.id,
                "soldier_id": designation.soldier.user_id if designation.soldier else None,
                "soldier_name": designation.soldier.name_and_rank() if designation.soldier else None,
                "unit_uic": designation.unit.uic if designation.unit else None,
                "unit_name": designation.unit.short_name if designation.unit else None,
                "designation_type": designation.designation.type,
                "designation_description": designation.designation.description,
                "start_date": designation.start_date.date() if designation.start_date else None,
                "end_date": designation.end_date.date() if designation.end_date else None,
                "active": designation.is_active(),
                "created_by_id": (
                    designation.history.earliest().last_modified_by.user_id
                    if designation.history.earliest().last_modified_by
                    else None
                ),
                "created_by_name": (
                    designation.history.earliest().last_modified_by.name_and_rank()
                    if designation.history.earliest().last_modified_by
                    else None
                ),
                "last_modified_id": designation.last_modified_by.user_id if designation.last_modified_by else None,
                "last_modified_name": (
                    designation.last_modified_by.name_and_rank()
                    if designation.last_modified_by
                    else None if designation.last_modified_by else None
                ),
                "supporting_docs": SupportingDocument.objects.filter(
                    related_designation__id=designation.id, visible_to_user=True
                ).exists(),
            }
        )

    return JsonResponse({"designations": final_designations})
