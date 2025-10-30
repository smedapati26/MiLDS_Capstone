import datetime
from typing import List

from django.db import transaction
from django.db.models import Prefetch, Q
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Query, Router
from ninja.errors import HttpError

from notifications.models import AccessRequestNotification, ApprovedDeniedNotification, TransferRequestNotification
from notifications.utils import send_soldier_notification
from personnel.api.soldier_requests.schema import (
    AdjudicateRequestsIn,
    AdjudicateRequestsOut,
    CreatePermissionRequestSchema,
    CreateTransferRequestSchema,
    ManagedUnitsWithPermissionsOut,
    ManagedUnitsWithTransfersOut,
    PermissionRequestOut,
    ReceivedTransferRequestOut,
    RequestCountsOut,
    SentTransferRequestOut,
    TransferRequestPocOut,
    UnitWithSoldiers,
)
from personnel.model_utils.UserRole import UserRoleAccessLevel
from personnel.models import Login, Soldier, SoldierTransferRequest, UserRequest, UserRole
from personnel.utils import get_unique_unit_managers
from units.models import Unit
from utils.http.user_id import get_user_id

router = Router()


@router.get("/request-counts", response=RequestCountsOut, summary="Get Soldier Request Counts")
def get_request_counts(request: HttpRequest):
    """
    Get counts of pending permission and transfer requests within units
    where the soldier has manager access

    @param request: HTTP request object
    @returns: Counts of requests requiring manager review
    """
    user_id = get_user_id(request.headers)
    if not user_id:
        raise HttpError(400, "No user ID in header")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    if requesting_user.is_admin:
        managed_units = Unit.objects.all().values_list("uic", flat=True)

    else:
        manager_roles = UserRole.objects.filter(user_id=requesting_user, access_level=UserRoleAccessLevel.MANAGER)

        managed_units = []
        for role in manager_roles:
            managed_units.extend([role.unit.uic, *role.unit.subordinate_uics])

    permission_request_count = UserRequest.objects.filter(uic__uic__in=managed_units).count()

    transfer_request_count = (
        SoldierTransferRequest.objects.filter(
            Q(gaining_unit__uic__in=managed_units) | Q(soldier__unit__uic__in=managed_units)
        )
        .distinct()
        .count()
    )

    return {"permission_request_count": permission_request_count, "transfer_request_count": transfer_request_count}


@router.post(
    "/adjudicate-permission-requests/",
    response=AdjudicateRequestsOut,
    summary="Adjudicate Permission Requests",
)
def adjudicate_permission_requests(request: HttpRequest, data: AdjudicateRequestsIn):
    """
    Batch adjudicate permission/role requests

    @param request: HTTP request object
    @param data: Request IDs, approval decision, and adjudicator DOD ID
    @returns: Result of batch adjudication
    @raises HttpError: 404 if adjudicator not found, 400 if request_ids is empty
    """
    if not data.request_ids:
        raise HttpError(400, "request_ids cannot be empty")

    adjudicator = get_object_or_404(Soldier, user_id=data.adjudicator_dod_id)

    permission_requests = UserRequest.objects.filter(id__in=data.request_ids).select_related("user_id", "uic")

    if not permission_requests.exists():
        raise HttpError(404, "No permission requests found with provided IDs")

    processed_count = 0

    with transaction.atomic():
        for permission_request in permission_requests:
            if data.approved:
                UserRole.objects.get_or_create(
                    user_id=permission_request.user_id,
                    unit=permission_request.uic,
                    defaults={"access_level": permission_request.access_level},
                )

            notification = ApprovedDeniedNotification.objects.create(
                request_type="Permission Request",
                request_action=f"{permission_request.access_level} access for {permission_request.uic.display_name}",
                approved_denied="approved" if data.approved else "denied",
                date_generated=timezone.now().replace(microsecond=0),
            )
            send_soldier_notification(soldier=permission_request.user_id, notification=notification)

            processed_count += 1

        permission_requests.delete()

    return AdjudicateRequestsOut(
        processed_count=processed_count,
        success=True,
        message=f"Successfully {'approved' if data.approved else 'denied'} {processed_count} permission request(s)",
    )


@router.post(
    "/adjudicate-transfer-requests/",
    response=AdjudicateRequestsOut,
    summary="Adjudicate Transfer Requests",
)
def adjudicate_transfer_requests(request: HttpRequest, data: AdjudicateRequestsIn):
    """
    Batch adjudicate soldier transfer requests

    @param request: HTTP request object
    @param data: Request IDs, approval decision, and adjudicator DOD ID
    @returns: Result of batch adjudication
    @raises HttpError: 404 if adjudicator not found, 400 if request_ids is empty
    """
    if not data.request_ids:
        raise HttpError(400, "request_ids cannot be empty")

    adjudicator = get_object_or_404(Soldier, user_id=data.adjudicator_dod_id)

    transfer_requests = SoldierTransferRequest.objects.filter(id__in=data.request_ids).select_related(
        "soldier", "gaining_unit", "requester"
    )

    if not transfer_requests.exists():
        raise HttpError(404, "No transfer requests found with provided IDs")

    processed_count = 0

    with transaction.atomic():
        for transfer_request in transfer_requests:
            if data.approved:
                soldier = transfer_request.soldier
                soldier.unit = transfer_request.gaining_unit
                soldier.save()
                SoldierTransferRequest.objects.filter(soldier=soldier).exclude(id=transfer_request.id).delete()

            notification = ApprovedDeniedNotification.objects.create(
                request_type="Transfer Request",
                request_action=f"{transfer_request.soldier.name_and_rank()} to be transferred into {transfer_request.gaining_unit.display_name}",
                approved_denied="approved" if data.approved else "denied",
                date_generated=timezone.now().replace(microsecond=0),
            )
            send_soldier_notification(soldier=transfer_request.requester, notification=notification)

            processed_count += 1

        transfer_requests.delete()

    return AdjudicateRequestsOut(
        processed_count=processed_count,
        success=True,
        message=f"Successfully {'approved' if data.approved else 'denied'} {processed_count} transfer request(s)",
    )


@router.get(
    "/permission-requests",
    response=list[ManagedUnitsWithPermissionsOut],
    summary="Get Managed Units with Permission Requests",
)
def get_managed_units_with_permission_requests(request: HttpRequest):
    """
    Get all units where soldier has manager role, including their subordinate units,
    with pending permission requests for each unit

    @param request: HTTP request object
    @returns: List of units with their pending permission requests
    """
    user_id = get_user_id(request.headers)
    if not user_id:
        raise HttpError(400, "No user ID in header")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    if requesting_user.is_admin:
        managed_units = Unit.objects.all().values_list("uic", flat=True)

    else:
        manager_roles = UserRole.objects.filter(user_id=requesting_user, access_level=UserRoleAccessLevel.MANAGER)

        managed_units = []
        for role in manager_roles:
            managed_units.extend([role.unit.uic, *role.unit.subordinate_uics])

    units_with_requests = (
        Unit.objects.filter(uic__in=managed_units, userrequest__isnull=False)
        .distinct()
        .prefetch_related(Prefetch("userrequest_set", queryset=UserRequest.objects.select_related("user_id__unit")))
    )

    if not units_with_requests:
        return []

    requesting_soldiers = {
        user_request.user_id for unit in units_with_requests for user_request in unit.userrequest_set.all()
    }

    soldier_ids = [s.user_id for s in requesting_soldiers]
    all_logins = Login.objects.filter(user__user_id__in=soldier_ids).select_related("user").order_by("-login_time")

    last_logins = {}
    for login in all_logins:
        if login.user.user_id not in last_logins:
            last_logins[login.user.user_id] = login.login_time

    soldier_ids = [s.user_id for s in requesting_soldiers]
    roles = UserRole.objects.filter(user_id__user_id__in=soldier_ids, unit__uic__in=managed_units).select_related(
        "user_id", "unit"
    )

    existing_roles = {(role.user_id.user_id, role.unit.uic): role.access_level for role in roles}

    result = []
    for unit in units_with_requests:
        requests = []
        for user_request in unit.userrequest_set.all():
            req_soldier = user_request.user_id
            last_active = last_logins.get(req_soldier.user_id)

            requests.append(
                PermissionRequestOut(
                    request_id=user_request.id,
                    name=f"{req_soldier.first_name} {req_soldier.last_name}",
                    rank=req_soldier.rank,
                    dod_id=req_soldier.user_id,
                    unit=req_soldier.unit.short_name,
                    last_active=last_active.strftime("%m/%d/%Y") if last_active else "Never",
                    current_role=existing_roles.get((req_soldier.user_id, unit.uic)),
                    requested_role=user_request.access_level,
                )
            )

        result.append(ManagedUnitsWithPermissionsOut(unit_uic=unit.uic, unit_name=unit.short_name, requests=requests))

    return result


@router.get(
    "/transfer-requests",
    response=ManagedUnitsWithTransfersOut,
    summary="Get Managed Units with Transfer Requests",
)
def get_managed_units_with_transfer_requests(request: HttpRequest):
    """
    Get all transfer requests for units where soldier has manager role.
    Returns both received requests (transfers into managed units) and sent requests
    (transfers out of managed units).

    @param request: HTTP request object
    @returns: Object containing received and sent transfer requests
    """
    user_id = get_user_id(request.headers)
    if not user_id:
        raise HttpError(400, "No user ID in header")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    if requesting_user.is_admin:
        managed_units = Unit.objects.all().values_list("uic", flat=True)

    else:
        manager_roles = UserRole.objects.filter(user_id=requesting_user, access_level=UserRoleAccessLevel.MANAGER)

        managed_units = []
        for role in manager_roles:
            managed_units.extend([role.unit.uic, *role.unit.subordinate_uics])

    received_transfer_requests = (
        SoldierTransferRequest.objects.filter(gaining_unit__uic__in=managed_units)
        .select_related("soldier__unit", "gaining_unit", "requester")
        .order_by("id")
    )

    sent_transfer_requests = (
        SoldierTransferRequest.objects.filter(soldier__unit__uic__in=managed_units)
        .select_related("soldier__unit", "gaining_unit")
        .order_by("id")
    )

    received_requests = []
    for req in received_transfer_requests:
        received_requests.append(
            ReceivedTransferRequestOut(
                request_id=req.id,
                name=f"{req.soldier.first_name} {req.soldier.last_name}",
                rank=req.soldier.rank,
                dod_id=req.soldier.user_id,
                current_unit=req.soldier.unit.short_name,
                current_unit_uic=req.soldier.unit.uic,
                requesting_unit=req.gaining_unit.short_name,
                requesting_unit_uic=req.gaining_unit.uic,
                requested_by=req.requester.name_and_rank(),
            )
        )

    gaining_unit_uics = list(set(req.gaining_unit.uic for req in sent_transfer_requests))

    gaining_unit_managers = UserRole.objects.filter(
        unit__uic__in=gaining_unit_uics, access_level=UserRoleAccessLevel.MANAGER
    ).select_related("user_id")

    unit_pocs = {}
    for manager_role in gaining_unit_managers:
        uic = manager_role.unit.uic
        if uic not in unit_pocs:
            unit_pocs[uic] = []
        unit_pocs[uic].append(
            TransferRequestPocOut(
                name=manager_role.user_id.name_and_rank(),
                email=manager_role.user_id.dod_email,
            )
        )

    sent_requests = []
    for req in sent_transfer_requests:
        pocs = unit_pocs.get(req.gaining_unit.uic, [])

        sent_requests.append(
            SentTransferRequestOut(
                name=f"{req.soldier.first_name} {req.soldier.last_name}",
                rank=req.soldier.rank,
                dod_id=req.soldier.user_id,
                current_unit=req.soldier.unit.short_name,
                gaining_unit=req.gaining_unit.short_name,
                pocs=pocs,
            )
        )

    return ManagedUnitsWithTransfersOut(
        received_requests=received_requests,
        sent_requests=sent_requests,
    )


@router.get("/units/soldiers", response=List[UnitWithSoldiers], summary="Get Units with Soldiers")
def get_units_with_soldiers(
    request: HttpRequest, uics: List[str] = Query(..., description="List of Unit Identification Codes")
):
    """
    Gets soldiers for the specified units.

    @param request: HttpRequest object
    @param uics: List of Unit Identification Codes
    @returns List[UnitWithSoldiers]: List of units with their soldiers
    """
    # Get all soldiers for the specified units
    soldiers = (
        Soldier.objects.filter(unit__uic__in=uics)
        .select_related("unit", "primary_mos")
        .order_by("unit__uic", "last_name", "first_name")
    )

    # Group soldiers by unit
    units_data = {}
    for soldier in soldiers:
        unit_uic = soldier.unit.uic

        if unit_uic not in units_data:
            units_data[unit_uic] = {"id": unit_uic, "unit_name": soldier.unit.short_name, "soldiers": []}

        is_amtp_maintainer = bool(soldier.is_maintainer and soldier.primary_mos and soldier.primary_mos.amtp_mos)

        units_data[unit_uic]["soldiers"].append(
            {
                "user_id": soldier.user_id,
                "rank": soldier.rank or "",
                "first_name": soldier.first_name,
                "last_name": soldier.last_name,
                "is_maintainer": soldier.is_maintainer,
                "is_amtp_maintainer": is_amtp_maintainer,
            }
        )

    return [units_data[uic] for uic in uics if uic in units_data]


@router.post("/transfer-requests", response={201: dict, 404: dict})
def create_transfer_request(request: HttpRequest, data: CreateTransferRequestSchema):
    """
    Create a new soldier transfer request

    @param request: HTTP request object
    @param data: Soldier ID and gaining unit UIC
    @returns: Success message with transfer request ID
    """
    current_user_id = get_user_id(request.headers)

    requester = get_object_or_404(Soldier, user_id=current_user_id)
    soldier = get_object_or_404(Soldier, user_id=data.soldier_id)
    gaining_unit = get_object_or_404(Unit, uic=data.gaining_uic)

    transfer_request = SoldierTransferRequest.objects.create(
        requester=requester,
        gaining_unit=gaining_unit,
        soldier=soldier,
    )

    top_admins = set(Soldier.objects.filter(is_admin=True).values_list("user_id", flat=True))
    unique_managers = get_unique_unit_managers(soldier.unit)
    all_manager_ids = unique_managers | top_admins

    notification = TransferRequestNotification.objects.create(
        transfer_request=transfer_request, date_generated=timezone.now().replace(microsecond=0)
    )

    for manager_id in all_manager_ids:
        manager = Soldier.objects.get(user_id=manager_id)
        send_soldier_notification(soldier=manager, notification=notification)

    return 201, {"message": "Transfer request created successfully", "transfer_request_id": transfer_request.id}


@router.post("/permission-requests", response={201: dict, 404: dict})
def create_permission_request(request: HttpRequest, data: CreatePermissionRequestSchema):
    """
    Create a new user permission/role request

    @param request: HTTP request object
    @param data: User ID, unit UIC, and requested access level
    @returns: Success message
    """
    user = get_object_or_404(Soldier, user_id=data.user_id)
    unit = get_object_or_404(Unit, uic=data.uic)

    access_request = UserRequest.objects.create(
        user_id=user,
        uic=unit,
        access_level=data.access_level,
    )

    top_admins = set(Soldier.objects.filter(is_admin=True).values_list("user_id", flat=True))
    unique_managers = get_unique_unit_managers(unit) | top_admins

    notification = AccessRequestNotification.objects.create(
        access_request=access_request, date_generated=timezone.now().replace(microsecond=0)
    )

    for manager in unique_managers:
        manager_user = Soldier.objects.get(user_id=manager)
        send_soldier_notification(soldier=manager_user, notification=notification)

    return 201, {"message": "Created Access Request"}
