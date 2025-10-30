from http import HTTPStatus
from typing import List, Optional

from django.http import HttpRequest
from django.shortcuts import get_list_or_404, get_object_or_404
from ninja import Query, Router
from ninja.errors import HttpError

from consistency.models import LogicalClock
from personnel.models import Soldier, UserRole
from tasks.models import Ictl
from units.api.schema import (
    CreateUnitIn,
    ShinyTaskForceOut,
    ShinyUnitOut,
    UnitBriefOut,
    UnitFilterSchema,
    UnitOut,
    UnitUCTLInfo,
    UnitUCTLResponse,
    UpdateUnitIn,
)
from units.models import Unit
from units.utils import generate_tf_uic
from utils.http import get_user_id, user_has_roles_with_soldiers, user_has_roles_with_units

router = Router()


@router.post("", response=UnitOut, summary="Create Unit")
def create_unit(request: HttpRequest, payload: CreateUnitIn):
    """
    Creates a new Unit. At this time, only allows creation of a TaskForce
    """
    unit_data = payload.dict(exclude_unset=True)
    parent_uic = unit_data.pop("parent_uic", None)
    if parent_uic:
        unit_data["parent_unit"] = get_object_or_404(Unit, uic=parent_uic)
    # Task Forces require a generated UIC
    unit_data["uic"] = generate_tf_uic()
    unit = Unit(**unit_data)

    clock = LogicalClock.objects.get(model=Unit.__name__)
    clock.current_time += 1
    unit.set_all_unit_lists(save=False)

    unit.as_of_logical_time = clock.current_time
    unit.set_all_unit_lists(save=False)
    clock.save()
    unit.save()

    # Need to update uic lists for Higher Headquarters
    # (not possible for this unit to have children or subordinates at creation time)
    for uic in set(unit.parent_uics):
        unit_to_update = Unit.objects.get(uic=uic)
        unit_to_update.set_all_unit_lists(save=False)
        unit_to_update.as_of_logical_time = clock.current_time
        unit_to_update.save()
    return unit


@router.get("", response=List[UnitBriefOut], summary="List Units")
def list_units(
    request: HttpRequest,
    top_level_uic: Optional[str] = None,
    sort_by: Optional[str] = None,
    hierarchical: bool = False,
    role: str = None,
    filters: UnitFilterSchema = Query(...),
):
    """
    Lists units according the given parameters

    @param top_level_uic (str): UIC of the unit to use as the top level unit when filtering
    @param sort_by (str): the field to sort by
    @param hierarchical (bool): UNUSED CURRENTLY - if the list should be returned hierarchically nested
    @param filters (UnitFilterSchema): Django Ninja Filter schema
    """
    user_id = get_user_id(request.headers)
    if not user_id:
        raise HttpError(400, "No user ID in header")

    units_qs = Unit.objects.all()

    if top_level_uic:
        top_unit = get_object_or_404(Unit, uic=top_level_uic)
        units_qs = units_qs.filter(uic__in=top_unit.subordinate_unit_hierarchy(include_self=True))

    # Filter by user role if specified
    if role:
        role_unit_uics = UserRole.objects.filter(user_id__user_id=user_id, access_level=role).values_list(
            "unit__uic", flat=True
        )

        units_qs = units_qs.filter(uic__in=list(role_unit_uics))

    # Apply remaining filters
    units_qs = filters.filter(units_qs)

    if sort_by:
        units_qs = units_qs.order_by(sort_by)

    return units_qs


@router.get("/{str:uic}", response=UnitOut, summary="Read Unit")
def read_unit(request: HttpRequest, uic: str):

    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    return get_object_or_404(Unit, uic=uic)


@router.put("/{str:uic}", response=UnitOut, summary="Update Unit")
def update_unit(request: HttpRequest, uic: str, payload: UpdateUnitIn):
    unit = get_object_or_404(Unit, uic=uic)
    unit_data = payload.dict(exclude_unset=True)
    clock = LogicalClock.objects.get(model=Unit.__name__)
    clock.current_time += 1

    parent_uic = unit_data.pop("parent_uic", None)
    if parent_uic:
        parent_unit = get_object_or_404(Unit, uic=parent_uic)
        # Add previous hierarchy to set of units to update
        units_to_update = set(unit.parent_uics)
        # Change parent_unit and update list of parents
        unit.parent_unit = parent_unit
        unit.set_all_unit_lists(save=False)
        # Add new hierarchy to set of units to update
        units_to_update.update(unit.parent_uics)
        units_to_update.update(unit.subordinate_uics)
        for uic_to_update in units_to_update:
            unit_to_update = Unit.objects.get(uic=uic_to_update)
            unit_to_update.set_all_unit_lists(save=False)
            unit_to_update.as_of_logical_time = clock.current_time
            unit_to_update.save()

    for attr, value in unit_data.items():
        setattr(unit, attr, value)

    unit.as_of_logical_time = clock.current_time
    clock.save()
    unit.save()
    return unit


@router.get(
    "/unit/{str:uic}/unit_hierarchy", response=UnitUCTLResponse, summary="Get Unit hierarchy with MOS and SL Breakdown"
)
def get_unit_hierarchy(request: HttpRequest, uic: str):
    """
    Get UCTL MOS and skill level breakdown for a unit, its parent, and direct children.

    @param request: HttpRequest object
    @param uic: Unit Identification Code
    @returns UnitUCTLResponse: Parent, target, and child units with their UCTL MOS/skill levels
    """
    target_unit = get_object_or_404(Unit, uic=uic)

    # Collect all units to process
    all_units = [target_unit]

    if target_unit.parent_unit:
        all_units.append(target_unit.parent_unit)

    child_units = Unit.objects.filter(uic__in=target_unit.child_uics)
    all_units.extend(child_units)

    # Get all UCTLs for these units in one query
    all_uics = [unit.uic for unit in all_units]
    uctls = (
        Ictl.objects.filter(unit__uic__in=all_uics)
        .exclude(proponent="USAACE")
        .prefetch_related("mos")
        .select_related("unit")
    )

    # Build response data for each unit
    response_units = {}

    for unit in all_units:
        mos_skill_levels = {}
        for uctl in uctls:
            if uctl.unit.uic == unit.uic and uctl.skill_level:
                for mos in uctl.mos.all():
                    mos_code = mos.mos_code
                    if mos_code not in mos_skill_levels:
                        mos_skill_levels[mos_code] = set()
                    mos_skill_levels[mos_code].add(uctl.skill_level)

        response_units[unit.uic] = UnitUCTLInfo(
            uic=unit.uic,
            short_name=unit.short_name,
            display_name=unit.display_name,
            mos_skill_levels={mos: sorted(levels) for mos, levels in mos_skill_levels.items()},
        )

    return UnitUCTLResponse(
        parent_unit=response_units.get(target_unit.parent_unit.uic) if target_unit.parent_unit else None,
        target_unit=response_units[target_unit.uic],
        child_units=[response_units[unit.uic] for unit in child_units],
    )


#########
# SHINY #
#########
@router.get("/shiny", response=List[ShinyUnitOut], summary="List Units (Shiny response schema)")
def shiny_list_all_units(request: HttpRequest):
    """
    Lists units for the shiny application

    """
    return Unit.objects.all()


@router.get("/shiny-task-force", response=List[ShinyTaskForceOut], summary="List Task Forces (Shiny response schema)")
def shiny_list_all_task_forces(request: HttpRequest):
    """
    Lists task forces for the shiny application

    """
    return Unit.objects.filter(uic__startswith="TF")
