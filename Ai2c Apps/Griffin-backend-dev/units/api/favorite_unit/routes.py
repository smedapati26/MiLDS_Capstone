from typing import List

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router

from auto_dsr.models import Unit, User
from units.api.favorite_unit.schema import UnitUICList
from units.api.schema import UnitBriefOut
from units.models import FavoriteUnit
from utils.http import get_user_id

router = Router()


@router.get("/{user_id}", response={200: List[UnitBriefOut]})
def get_list_of_user_favorites(request: HttpRequest, user_id: str):
    """
    Get List of user favorite units
    """
    user = get_object_or_404(User, user_id=user_id)
    # get all favorite units
    favorite_units = Unit.objects.filter(favorite_unit__user_id=user)
    return favorite_units


@router.post("/{user_id}", response={200: List[UnitBriefOut]})
def set_user_favorite(request: HttpRequest, user_id: str, payload: UnitUICList):
    """
    Adds units to the user favorite list. Returns updated list of favorite units.
    """

    # get requesting user auth
    requesting_user_id = get_user_id(request.headers)
    requesting_user = get_object_or_404(User, user_id=requesting_user_id)

    user = get_object_or_404(User, user_id=user_id)

    # check that the user is the same as auth
    if requesting_user != user:
        return HttpResponse("Unauthorized", status=401)

    favorited_units = Unit.objects.filter(uic__in=payload.uics)
    for unit in favorited_units:
        FavoriteUnit.objects.get_or_create(user_id=user, unit=unit)

    return Unit.objects.filter(favorite_unit__user_id=user)


@router.delete("/{user_id}", response={200: List[UnitBriefOut]})
def remove_user_favorite(request: HttpRequest, user_id: str, payload: UnitUICList):
    """
    Removes units from user favorites. Returns updated list of favorite units.
    """
    # get requesting user auth
    requesting_user_id = get_user_id(request.headers)
    requesting_user = get_object_or_404(User, user_id=requesting_user_id)

    user = get_object_or_404(User, user_id=user_id)

    # check that the user is the same as auth
    if requesting_user != user:
        return HttpResponse("Unauthorized", status=401)

    FavoriteUnit.objects.filter(user_id=user, unit__in=payload.uics).delete()

    return Unit.objects.filter(favorite_unit__user_id=user)
