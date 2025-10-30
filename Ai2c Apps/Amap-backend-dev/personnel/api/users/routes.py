from http import HTTPStatus
from typing import List

from django.db.models import Q
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_list_or_404, get_object_or_404
from django.utils import timezone
from ninja import Router
from ninja.errors import HttpError

from forms.model_utils import EvaluationResult
from forms.models import Event
from personnel.api.users.schema import LoginOut, MOSCodeOut, SoldierOut, UserIn, UserOut, UserRolesOut
from personnel.model_utils.UserRole import UserRoleAccessLevel
from personnel.models import Login, MOSCode, Soldier, SoldierTransferRequest, Unit, UserRole
from personnel.utils import get_soldier_arrival_at_unit, get_soldier_designations, get_soldier_eval_status
from personnel.utils.get_soldier_mos_ml_dict import get_soldier_mos_ml
from personnel.utils.single_soldier_availability import get_prevailing_user_status
from utils.http import get_user_id, get_user_name, user_has_roles_with_soldiers, user_has_roles_with_units

router = Router()


@router.post("", response=UserOut, auth=None)
def create_user(request: HttpRequest, payload: UserIn):
    """Create a new A-MAP user"""
    unit = get_object_or_404(Unit, uic=payload.unit_uic)

    return Soldier.objects.create(
        user_id=payload.user_id,
        rank=payload.rank,
        first_name=payload.first_name,
        last_name=payload.last_name,
        unit=unit,
        is_admin=False,  # It should be impossible to set the is_admin flag from the app
        is_maintainer=False,
    )


@router.get("/{user_id}", response=SoldierOut)
def get_user(request: HttpRequest, user_id: str):
    """Get an individual user's details"""
    requester_id = get_user_id(request.headers)

    if not requester_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = Soldier.objects.get(user_id=requester_id)

    # Get the soldier
    soldier = get_object_or_404(Soldier, user_id=user_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [soldier]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    # Get most recent annual evaluation with GO status
    recent_annual_eval = (
        Event.objects.filter(
            soldier=soldier,
            event_type__type="Evaluation",
            evaluation_type__type="Annual",
            go_nogo=EvaluationResult.GO,
            event_deleted=False,
        )
        .order_by("-date")
        .first()
    )
    recent_eval_date = recent_annual_eval.date if recent_annual_eval else None

    user_details = {
        "user_id": soldier.user_id,
        "rank": soldier.rank,
        "first_name": soldier.first_name,
        "last_name": soldier.last_name,
        "display": soldier.name_and_rank(),
        "pv2_dor": soldier.pv2_dor,
        "pfc_dor": soldier.pfc_dor,
        "spc_dor": soldier.spc_dor,
        "sgt_dor": soldier.sgt_dor,
        "ssg_dor": soldier.ssg_dor,
        "sfc_dor": soldier.sfc_dor,
        "unit_id": soldier.unit.uic,
        "dod_email": soldier.dod_email,
        "receive_emails": soldier.recieve_emails,
        "birth_month": soldier.birth_month,
        "is_admin": soldier.is_admin,
        "is_maintainer": soldier.is_maintainer,
        "availability_status": get_prevailing_user_status(soldier),
        "primary_mos": soldier.primary_mos.mos if soldier.primary_mos else "None",
        "primary_ml": get_soldier_mos_ml(soldier),
        "all_mos_and_ml": get_soldier_mos_ml(soldier, all=True) or {},
        "designations": get_soldier_designations(soldier.user_id) or "",
        "arrival_at_unit": get_soldier_arrival_at_unit(soldier),
        "annual_evaluation": recent_eval_date,
        "evaluation_status": get_soldier_eval_status(requesting_user)[2],
    }

    return user_details


@router.put("/{user_id}", response=UserOut)
def update_user(request: HttpRequest, user_id: str, payload: UserIn):
    """Update a A-MAP user"""

    if user_id != get_user_id(request.headers):
        raise HttpError(401, "Cannot update another user's profile.")
    user = get_object_or_404(Soldier, user_id=user_id)
    try:
        unit = Unit.objects.get(uic=payload.unit_uic)
    except Unit.DoesNotExist:
        raise HttpError(400, "Invalid Unit specified in request body.")

    user.rank = payload.rank
    user.first_name = payload.first_name
    user.last_name = payload.last_name
    user.unit = unit
    user.save()

    return user


login_router = Router()


@login_router.get("", response=LoginOut, summary="Who Am I?")
def who_am_i(request: HttpRequest):
    """Complete the initial user login sequence, returning the current user's information"""
    user_id = get_user_id(request.headers)

    try:
        user = Soldier.objects.get(user_id=user_id)
        Login.objects.create(user=user, login_time=timezone.now())

        user_roles = UserRole.objects.filter(user_id=user)
        elevated_roles = {"viewer": set(), "recorder": set(), "manager": set()}

        for role in user_roles:
            if role.access_level == UserRoleAccessLevel.VIEWER:
                elevated_roles["viewer"].update(role.unit.subordinate_unit_hierarchy(include_self=True))
            if role.access_level == UserRoleAccessLevel.RECORDER:
                elevated_roles["recorder"].update(role.unit.subordinate_unit_hierarchy(include_self=True))
            elif role.access_level == UserRoleAccessLevel.MANAGER:
                elevated_roles["manager"].update(role.unit.subordinate_unit_hierarchy(include_self=True))

        user.unit_roles = elevated_roles

        user.has_open_requests = (
            SoldierTransferRequest.objects.filter(gaining_unit__uic__in=elevated_roles["manager"]).exists()
            or SoldierTransferRequest.objects.filter(soldier__unit__uic__in=elevated_roles["manager"]).exists()
        )

        return user

    except Soldier.DoesNotExist:
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


@router.get("/mos_codes/{type}", response=List[MOSCodeOut], summary="Get MOS Codes")
def list_mos_codes(request: HttpRequest, type: str):
    """
    Returns designated queried MOSCode object data.
    @param request: (django.http.HttpRequest) the request object
    @param type: (str) the type of request
        - "all" return all mos - default
        - "amtp" return mos that apply to amtp
        - "ictl" return mos that have ictls
        - "amtp_or_ictl" return mos that are either amtp or ictl mos
    @returns List[MOSCodeOut] - List of MOS codes
    """
    if type == "all":
        mos_codes = MOSCode.objects.all()
    elif type == "amtp":
        mos_codes = MOSCode.objects.filter(amtp_mos=True)
    elif type == "ictl":
        mos_codes = MOSCode.objects.filter(ictl_mos=True)
    elif type == "amtp_or_ictl":
        mos_codes = MOSCode.objects.filter(Q(ictl_mos=True) | Q(amtp_mos=True))
    else:
        raise ValueError(f"Type '{type}' not recognized. Valid types are: all, amtp, ictl, amtp_or_ictl")

    mos_codes = mos_codes.order_by("-amtp_mos", "-ictl_mos", "mos")
    return [{"MOS": mos_code.mos, "MOS_Description": mos_code.mos_description} for mos_code in mos_codes]


@router.get("/elevated_roles/{user_id}", response=UserRolesOut)
def get_user_elevated_roles(request: HttpRequest, user_id: str):
    """
    Get a list of all roles for a user in AMAP's backend.
    Returns:
        {
            "viewer": [<UICs with VIEWER access, including subordinates>],
            "recorder": [<UICs with RECORDER access, including subordinates>],
            "manager": [<UICs with MANAGER access, including subordinates>]
        }
    """
    user = get_object_or_404(Soldier, user_id=user_id)

    elevated_roles = {"viewer": set(), "recorder": set(), "manager": set()}

    user_roles = UserRole.objects.filter(user_id=user)

    for role in user_roles:
        if role.access_level == UserRoleAccessLevel.VIEWER:
            elevated_roles["viewer"].update(role.unit.subordinate_unit_hierarchy(include_self=True))
        if role.access_level == UserRoleAccessLevel.RECORDER:
            elevated_roles["recorder"].update(role.unit.subordinate_unit_hierarchy(include_self=True))
        elif role.access_level == UserRoleAccessLevel.MANAGER:
            elevated_roles["manager"].update(role.unit.subordinate_unit_hierarchy(include_self=True))

    return JsonResponse(
        {
            "viewer": sorted(elevated_roles["viewer"]),
            "recorder": sorted(elevated_roles["recorder"]),
            "manager": sorted(elevated_roles["manager"]),
        }
    )
