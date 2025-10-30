from typing import Dict, List

from django.db.models import Q
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Query, Router
from ninja.pagination import paginate
from ninja.responses import codes_4xx

from auto_dsr.api.schema import LocationFilter, LocationOut, UnitFilter, UnitOut
from auto_dsr.models import Location, Unit
from auto_dsr.views import get_model_bank_for_unit
from scripts.units.similar_units import get_unit_feature_vectors, update_similar_units_knn

auto_dsr_router = Router()


######## BANK TIME ########
@auto_dsr_router.get("/bank-time-forecast", response=Dict)
def unit_bank_time_forecast(request: HttpRequest, uic: str):
    """
    Return a list of models in a given unit and their projected bank time over the next 12 months
    """
    return get_model_bank_for_unit(uic)


@auto_dsr_router.get("/unit", response=List[UnitOut], summary="Get list of units", auth=None)
def get_all_units(request: HttpRequest, top_level_uic: str = None, filters: UnitFilter = Query(...)):
    """
    Return a list of Units.
    """
    units_qs = Unit.objects.all()
    if top_level_uic:
        top_unit = get_object_or_404(Unit, uic=top_level_uic)
        units_qs = units_qs.filter(uic__in=top_unit.subordinate_unit_hierarchy(include_self=True))

    units_qs = filters.filter(units_qs)

    return units_qs


@auto_dsr_router.get("/unit/{str:uic}", response={200: UnitOut, codes_4xx: dict}, summary="Read Single Unit")
def read_unit(request: HttpRequest, uic: str):
    """
    Return information for a single UIC.
    """
    return get_object_or_404(Unit, uic=uic)


@auto_dsr_router.get("/update-similar-units", summary="Update Similar Units")
def update_similar_units(request: HttpRequest):
    """
    Trains a new KNN model and updates similar units for all units at once
    """
    try:
        knn, unit_vectors, unit_ids = get_unit_feature_vectors()
        update_similar_units_knn(knn, unit_vectors, unit_ids)
        return {"success": True}
    except:
        return {"success": False}


@auto_dsr_router.get("/subordinate-units", response=List[UnitOut])
def get_sub_units(request: HttpRequest, uic: str, level_down: int = 1):
    """
    Get subordinate unit information.
    @param uic: str - UIC for subordinate units
    @param level_down: int - Number of echelons down from UIC.
    @return list of unit information
    """
    unit = get_object_or_404(Unit, uic=uic)
    units = unit.subordinate_unit_hierarchy(include_self=False, level_down=level_down, only_level=True)
    return Unit.objects.filter(uic__in=units)


@auto_dsr_router.get("/models/location", response=List[LocationOut], summary="Gets the list of locations")
@paginate
def get_all_location(
    request: HttpRequest,
    filters: LocationFilter = Query(...),
):
    """
    Gets all of the available locations
    """

    location_qs = Location.objects.all().order_by("code")

    query = Q()
    if filters.id:
        query |= Q(id__icontains=filters.id)
    if filters.code:
        query |= Q(code__icontains=filters.code)
    if filters.name:
        query |= Q(name__icontains=filters.name)

    if query:
        location_qs = location_qs.filter(query)

    return location_qs
