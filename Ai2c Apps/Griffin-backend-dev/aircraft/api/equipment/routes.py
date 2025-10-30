from typing import List

from django.db.models import CharField, Count, ExpressionWrapper, F, FloatField, Q
from django.db.models.functions import Cast
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Router

from aircraft.api.equipment.schema import AircraftModelStatusOut
from aircraft.models import Aircraft
from auto_dsr.models import Unit

equipment_router = Router()


######## AIRCRAFT EQUIPMENT ########
@equipment_router.get(
    "/aircraft-model-status", response=List[AircraftModelStatusOut], summary="List of Aircraft Models with Status"
)
def aircraft_models_and_status(request: HttpRequest, uic: str):
    """
    Returns the list of aircraft models with their status.
    """
    # Verify the unit exists
    get_object_or_404(Unit, uic=uic)
    return (
        Aircraft.objects.filter(uic=uic, airframe__model__isnull=False)
        .values("airframe__model")
        .annotate(
            model=F("airframe__model"),
            total=Count("serial"),
            nrtl=Count("serial", filter=~Q(rtl__iexact="RTL")),
            rtl=Count("serial", filter=Q(rtl__iexact="RTL")),
            in_phase=Count("serial", filter=Q(hours_to_phase__lte=0.0)),
            fmc_count=Count("serial", filter=Q(status__iexact="FMC")),
            pmc_count=Count("serial", filter=Q(status__icontains="PMC")),
            nmc_count=Count("serial", filter=Q(status__in=["FIELD", "NMCS", "SUST", "NMC", "NMCM"])),
            dade_count=Count("serial", filter=Q(status__iexact="DADE")),
        )
        .annotate(
            fmc_percent=ExpressionWrapper(
                Cast(F("fmc_count"), output_field=FloatField()) / Cast(F("total"), output_field=FloatField()),
                output_field=FloatField(),
            ),
            pmc_percent=ExpressionWrapper(
                Cast(F("pmc_count"), output_field=FloatField()) / Cast(F("total"), output_field=FloatField()),
                output_field=FloatField(),
            ),
            nmc_percent=ExpressionWrapper(
                Cast(F("nmc_count"), output_field=FloatField()) / Cast(F("total"), output_field=FloatField()),
                output_field=FloatField(),
            ),
            dade_percent=ExpressionWrapper(
                Cast(F("dade_count"), output_field=FloatField()) / Cast(F("total"), output_field=FloatField()),
                output_field=FloatField(),
            ),
        )
    )
