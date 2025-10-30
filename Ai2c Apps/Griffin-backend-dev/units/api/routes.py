from typing import List

from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Query, Router

from consistency.models import LogicalClock
from units.api.schema import (
    CreateUnitIn,
    ShinyTaskForceOut,
    ShinyUnitOut,
    UnitBriefOut,
    UnitFilterSchema,
    UnitOut,
    UpdateUnitIn,
)
from units.models import Unit
from units.utils import generate_tf_uic

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


@router.get("", response=List[UnitBriefOut], summary="List Units", auth=None)
def list_units(
    request: HttpRequest,
    top_level_uic: str = None,
    sort_by: str = None,
    hierarchical: bool = False,
    filters: UnitFilterSchema = Query(...),
):
    """
    Lists units according the given parameters

    @param top_level_uic (str): UIC of the unit to use as the top level unit when filtering
    @param sort_by (str): the field to sort by
    @param hierarchical (bool): UNUSED CURRENTLY - if the list should be returned hierarchically nested
    @param filters (UnitFilterSchema): Django Ninja Filter schema
    """
    units_qs = Unit.objects.all()
    if top_level_uic:
        top_unit = get_object_or_404(Unit, uic=top_level_uic)
        units_qs = units_qs.filter(uic__in=top_unit.subordinate_unit_hierarchy(include_self=True))

    units_qs = filters.filter(units_qs)

    if sort_by:
        units_qs = units_qs.order_by(sort_by)

    return units_qs


@router.get("/{str:uic}", response=UnitOut, summary="Read Unit")
def read_unit(request: HttpRequest, uic: str):
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
