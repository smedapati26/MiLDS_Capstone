from django.http import HttpRequest, JsonResponse
from django.views import View

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from auto_dsr.model_utils import UnitEchelon


class AircraftModule(View):
    """
    Views related to the griffin.ai frontend's Aircraft Module
    """

    def get(self, request: HttpRequest, uic: str):
        """
        Gets a list of all aircraft assigned to the provided UIC

        @param self:
        @param request: (django.http.HttpRequest) the request object
        @param uic: (str) the unit identification code for the unit to retrieve aircraft within
        """
        requested_unit = Unit.objects.get(uic=uic)
        sub_units = list(Unit.objects.filter(parent_uic=uic).values("uic", "display_name"))

        unit = {"uic": uic, "display_name": requested_unit.display_name}

        if requested_unit.echelon == UnitEchelon.COMPANY:
            aircraft = list(
                Aircraft.objects.filter(uic=uic).values(
                    "serial",
                    "model",
                    "status",
                    "rtl",
                    "hours_to_phase",
                    "total_airframe_hours",
                    "location",
                    "remarks",
                    "date_down",
                    "ecd",
                )
            )
            unit["aircraft"] = aircraft
        else:
            for u in sub_units:
                u["aircraft"] = list(
                    Aircraft.objects.filter(uic=u["uic"]).values(
                        "serial",
                        "model",
                        "status",
                        "rtl",
                        "hours_to_phase",
                        "total_airframe_hours",
                        "location",
                        "remarks",
                        "date_down",
                        "ecd",
                    )
                )

        unit["sub_units"] = sub_units

        return JsonResponse(unit)
