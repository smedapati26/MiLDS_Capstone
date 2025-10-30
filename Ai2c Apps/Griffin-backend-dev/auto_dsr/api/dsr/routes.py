from datetime import datetime, timedelta
from typing import List

from dateutil.relativedelta import relativedelta
from django.db.models import Count, Sum
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.timezone import make_aware
from ninja import Query
from ninja.responses import codes_4xx
from simple_history.utils import update_change_reason

from aircraft.models import DA_1352, DA_2407, Aircraft, UnitPhaseFlowOrdering
from aircraft.utils import update_phase_order
from auto_dsr.api.dsr.schema import (
    Da2407In,
    Da2407Out,
    DsrFilterSchema,
    DsrOut,
    FlyingHoursOut,
    PhaseFlowOrder,
    PhaseFlowOrderIn,
)
from auto_dsr.api.routes import auto_dsr_router
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import Unit, User
from auto_dsr.utils import user_has_permissions_to
from fhp.models import MonthlyProjection
from utils.time.fiscal_year import get_fiscal_year_start
from utils.time.reporting_periods import get_reporting_period


@auto_dsr_router.get("", response=List[DsrOut], summary="Griffin AI automated DSR Data")
def list_dsr_data(request: HttpRequest, filters: DsrFilterSchema = Query(...)):
    """
    Returns a list of aircraft and their associated DSR data.

    All parameters are intended to filter request results.

    @param uic: Optional[str] - Unit to subset aircraft data
    @param transient: Optional[bool] - Whether the request should include transient aircraft

    @return List of DSR data by aircraft.  List contains:
        serial_number: str
        model: str
        status: str
        rtl: str
        remarks: str
        date_down: Optional[str]
        days_down: Optional[str]
        ecd: Optional[str]
        location: Optional[str]
        hours_to_phase: float
        flying_hours: float
        last_sync_time = datetime
        last_export_upload_time = datetime
        last_user_edit_time = datetime
        owning_unit_uic = str
    """
    if filters.transient:
        return Aircraft.objects.all().prefetch_related("modifications").annotate(mods=Count("modification"))
    elif filters.uic:
        return (
            Aircraft.objects.filter(uic=Unit.objects.get(uic=filters.uic))
            .prefetch_related("modifications")
            .annotate(mods=Count("modification"))
        )
    else:
        return (
            Aircraft.objects.all()
            .exclude(current_unit=Unit.objects.get(uic="TRANSIENT"))
            .prefetch_related("modifications")
            .annotate(mods=Count("modification"))
        )


@auto_dsr_router.get("/da-2407s", response=List[Da2407Out], summary="Unit DA 2407s List")
def list_da_2407s(request: HttpRequest, uic: str):
    """
    Return a list of all DA2407s for a unit and its subordinates. For Task Forces, list those
    that apply to that task force's aircraft
    """
    unit = get_object_or_404(Unit, uic=uic)
    if uic.startswith("TF"):
        return DA_2407.objects.filter(aircraft__uic=unit, is_archived=False)
    uic_list = unit.subordinate_unit_hierarchy(include_self=True)
    return DA_2407.objects.filter(customer_unit__uic__in=uic_list, is_archived=False)


@auto_dsr_router.post("/da-2407s", summary="Create DA 2407")
def create_da_2407(request: HttpRequest, payload: Da2407In):
    """
    Creates a single DA2407

    """
    pl = payload.dict()
    pl["submitted_datetime"] = make_aware(pl["submitted_datetime"])
    pl["accepted_datetime"] = make_aware(pl["accepted_datetime"])
    try:
        pl["work_start_datetime"] = make_aware(pl["work_start_datetime"])
    except:
        pass
    pl["customer_unit"] = get_object_or_404(Unit, uic=pl["customer_unit"])
    pl["support_unit"] = get_object_or_404(Unit, uic=pl["support_unit"])
    try:
        pl["aircraft"] = Aircraft.objects.get(serial=pl["aircraft"])
    except:
        pl.pop("aircraft")
        pass
    if user_has_permissions_to(
        request.auth, pl["support_unit"], access_level=UserRoleAccessLevel.WRITE
    ) or user_has_permissions_to(request.auth, pl["customer_unit"], access_level=UserRoleAccessLevel.WRITE):
        da_2407 = DA_2407.objects.create(**pl)
        return {"id": da_2407.id}
    else:
        return {"success": False}


@auto_dsr_router.get("/da-2407s/{order_id}", response=Da2407Out, summary="Read DA 2407")
def read_da_2407(request: HttpRequest, order_id: int):
    """
    Reads the details for an individual DA 2407
    """
    return get_object_or_404(DA_2407, id=order_id)


@auto_dsr_router.put("/da-2407s/{order_id}", summary="Update DA 2407")
def update_da_2407(request: HttpRequest, order_id: int, payload: Da2407In):
    """
    Updates a single DA 2407

    """
    pl = payload.dict()
    pl["submitted_datetime"] = make_aware(pl["submitted_datetime"])
    pl["accepted_datetime"] = make_aware(pl["accepted_datetime"])
    try:
        pl["work_start_datetime"] = make_aware(pl["work_start_datetime"])
    except:
        pass
    pl["customer_unit"] = get_object_or_404(Unit, uic=pl["customer_unit"])
    pl["support_unit"] = get_object_or_404(Unit, uic=pl["support_unit"])
    try:
        pl["aircraft"] = Aircraft.objects.get(serial=pl["aircraft"])
    except:
        pl.pop("aircraft")
        pass
    da_2407 = get_object_or_404(DA_2407, id=order_id)
    if user_has_permissions_to(
        request.auth, da_2407.customer_unit, access_level=UserRoleAccessLevel.WRITE
    ) or user_has_permissions_to(request.auth, da_2407.support_unit, access_level=UserRoleAccessLevel.WRITE):
        for attr, value in pl.items():
            setattr(da_2407, attr, value)
        da_2407.save()
        update_change_reason(da_2407, f"User edit {request.auth}")
        return {"success": True}
    else:
        return {"success": False}


@auto_dsr_router.delete("/da-2407s/{order_id}", summary="Delete DA 2407")
def delete_da_2407(request: HttpRequest, order_id: int):
    """
    Deletes a single DA2407

    """
    da_2407 = get_object_or_404(DA_2407, id=order_id)
    if user_has_permissions_to(
        request.auth, da_2407.customer_unit, access_level=UserRoleAccessLevel.WRITE
    ) or user_has_permissions_to(request.auth, da_2407.support_unit, access_level=UserRoleAccessLevel.WRITE):
        da_2407.delete()
        update_change_reason(da_2407, f"user deleted {request.auth}")
        return {"success": True}
    else:
        return {"success": False}


@auto_dsr_router.get("/flying-hours", response=FlyingHoursOut, summary="Get flying hours for a unit")
def get_flying_hours(request: HttpRequest, uic: str):
    """
    Get the flying hours for the current month and year for a unit.
    """
    unit = get_object_or_404(Unit, uic=uic)

    # Dates used for calculation
    _, end_date = get_reporting_period()
    fy_start = get_fiscal_year_start(datetime.now().date(), flying_hours=True)

    # Currently sum of total flying hours
    current_month_hours = (
        DA_1352.objects.filter(
            serial_number__uic__in=unit.subordinate_unit_hierarchy(include_self=True),
            reporting_month=end_date,
        )
        .values("serial_number", "flying_hours")
        .distinct()
        .aggregate(total_hours=Sum("flying_hours", default=0.0))
    )

    # Current sum of yearly hours flown
    current_year_hours = (
        DA_1352.objects.filter(
            serial_number__uic__in=unit.subordinate_unit_hierarchy(include_self=True),
            reporting_month__range=(fy_start, end_date),
        )
        .values("serial_number", "flying_hours")
        .distinct()
        .aggregate(total_hours=Sum("flying_hours", default=0.0))
    )

    # Total projected hours for the month
    monthly_total = MonthlyProjection.objects.filter(
        unit__in=unit.subordinate_unit_hierarchy(include_self=True), reporting_month=end_date
    ).aggregate(total_hours=Sum("projected_hours", default=0.0))

    # Total projected hours for the year
    yearly_total = MonthlyProjection.objects.filter(
        unit__in=unit.subordinate_unit_hierarchy(include_self=True),
        reporting_month__range=(fy_start, fy_start + relativedelta(years=+1) - timedelta(days=1)),
    ).aggregate(total_hours=Sum("projected_hours", default=0.0))

    return {
        "monthly_hours_flown": current_month_hours["total_hours"],
        "monthly_hours_total": monthly_total["total_hours"],
        "yearly_hours_flown": current_year_hours["total_hours"],
        "yearly_hours_total": yearly_total["total_hours"],
    }


@auto_dsr_router.get("/phase-flow-order", summary="Get the Phase Flow order for a UIC", response=List[PhaseFlowOrder])
def get_phase_flow_order(request: HttpRequest, uic: str):
    """
    Get the phase flow order for a UIC.
    Before returning the order, make sure the ordering is up to date with aircraft.
    @param UIC: (str) Unit ID to look for phase order.
    @return List of Phase Flow Order: Serial, uic, and order to be displayed sorted ascending.
    """
    update_phase_order(uic=uic)
    return UnitPhaseFlowOrdering.objects.filter(uic=uic).order_by("phase_order").values("uic", "serial", "phase_order")


@auto_dsr_router.post(
    "/phase-flow-order",
    summary="Create/Update/Delete the phase flow ordering for a UIC.",
    response={200: dict, codes_4xx: dict},
)
def update_phase_flow_order(request: HttpRequest, uic: str, payload: List[PhaseFlowOrderIn]):
    """
    Create or update a phase flow order for a UIC.
    @param UIC: (str) Unit ID to create/update the Phase Order
    @param payload: (List[{serial: (str), phase_order: (int)}]) List of serial numbers and their order in the chart
        If the payload is an empty list, the order will be deleted.
    @return (dict): {"success": (bool), "message": (str)}
    """
    user = get_object_or_404(User, user_id=request.auth.user_id)
    unit = get_object_or_404(Unit, uic=uic)
    if not user_has_permissions_to(user, unit, access_level=UserRoleAccessLevel.WRITE):
        return 403, {"success": False, "message": "Only users with write access may create/update a phase flow order."}

    # If existing ordering, remove them for the UIC and recreate.
    uic_recs = UnitPhaseFlowOrdering.objects.filter(uic=uic)
    if uic_recs.count() > 0:
        uic_recs.delete()

    for record in payload:
        rec = record.dict()
        try:
            aircraft = Aircraft.objects.get(serial=rec["serial"])
            UnitPhaseFlowOrdering.objects.create(
                uic=unit,
                serial=aircraft,
                phase_order=rec["phase_order"],
                last_changed_by_user=user,
                last_updated=timezone.now(),
            )
        except Aircraft.DoesNotExist:
            continue

    # Update the phase order to make sure all aircraft exist and belong to the unit.
    update_phase_order(uic=uic)
    return {"success": True, "message": "Phase order created."}
