from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router
from ninja.errors import HttpError

from auto_dsr.api.users.schema import LoginOut, UserIn, UserOut, UserRolesOut
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import Login, Unit, User, UserRole
from utils.http import get_user_id, get_user_name

router = Router()


@router.post("", response=UserOut, auth=None)
def create_user(request: HttpRequest, payload: UserIn):
    """Create a new Griffin user"""
    unit = get_object_or_404(Unit, uic=payload.unit_uic)
    global_unit = get_object_or_404(Unit, uic=payload.global_unit_uic) if payload.global_unit_uic else None

    return User.objects.create(
        user_id=payload.user_id,
        rank=payload.rank,
        first_name=payload.first_name,
        last_name=payload.last_name,
        unit=unit,
        global_unit=global_unit,
        job_description=None,
        is_admin=False,  # It should be impossible to set the is_admin flag from the app
        last_activity=None,
    )


@router.get("/{user_id}", response=UserOut)
def get_user(request: HttpRequest, user_id: str):
    """Get an individual user's details"""
    return get_object_or_404(User, user_id=user_id)


@router.put("/{user_id}", response=UserOut)
def update_user(request: HttpRequest, user_id: str, payload: UserIn):
    """Update a Griffin user"""

    if user_id != get_user_id(request.headers):
        raise HttpError(401, "Cannot update another user's profile.")
    user = get_object_or_404(User, user_id=user_id)
    try:
        unit = Unit.objects.get(uic=payload.unit_uic)
        global_unit = Unit.objects.get(uic=payload.global_unit_uic) if payload.global_unit_uic else None
    except Unit.DoesNotExist:
        raise HttpError(400, "Invalid Unit specified in request body.")

    user.rank = payload.rank
    user.first_name = payload.first_name
    user.last_name = payload.last_name
    user.unit = unit
    user.global_unit = global_unit
    user.job_description = payload.job_description
    user.save()

    return user


@router.get("/elevated_roles/{user_id}", response=UserRolesOut)
def get_user_elevated_roles(request: HttpRequest, user_id: str):
    """
    Get a list of all roles for a user in Griffin's backend.
    Returns:
        {
            "admin": [<UICs with ADMIN access, including subordinates>],
            "write": [<UICs with WRITE access, including subordinates>]
        }
    """
    user = get_object_or_404(User, user_id=user_id)

    elevated_roles = {"admin": set(), "write": set()}

    user_roles = UserRole.objects.filter(user_id=user)

    for role in user_roles:
        if role.access_level == UserRoleAccessLevel.ADMIN:
            elevated_roles["admin"].update(role.unit.subordinate_unit_hierarchy(include_self=True))
        elif role.access_level == UserRoleAccessLevel.WRITE:
            elevated_roles["write"].update(role.unit.subordinate_unit_hierarchy(include_self=True))

    return JsonResponse(
        {
            "admin": sorted(elevated_roles["admin"]),
            "write": sorted(elevated_roles["write"]),
        }
    )


login_router = Router()


@login_router.get("", response=LoginOut, summary="Who Am I?")
def who_am_i(request: HttpRequest):
    """Complete the initial user login sequence, returning the current user's information"""
    user_id = get_user_id(request.headers)

    try:
        user = User.objects.get(user_id=user_id)
        Login.objects.create(user_id=user, login_time=timezone.now())
        return user
    except User.DoesNotExist:
        first_name, last_name = get_user_name(request.headers)
        return JsonResponse(
            {
                "user_id": user_id,
                "rank": None,
                "first_name": first_name,
                "last_name": last_name,
                "is_admin": False,
                "new_user": True,
            }
        )
