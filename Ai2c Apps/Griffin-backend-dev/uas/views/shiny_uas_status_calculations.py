from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from auto_dsr.models import Unit
from uas.model_utils import UASStatuses
from uas.models import UAC, UAV
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def shiny_uas_status_calculations(request: HttpRequest, uic: str):
    """
    Retrieves all relevant status information based on the calculations pre-designated for UAS.
    Functionality for custom status calculations should be easy to implement here going forward if desired
    utilizing the threshold variables.

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the unit identification code for the unit to fetch uas from
    """
    try:  # to get the unit requested
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    # Get current Unit UAC and UAV
    vehicles_qs = UAV.objects.filter(tracked_by_unit=requested_unit)
    components_qs = UAC.objects.filter(tracked_by_unit=requested_unit)

    # Set up the system status return data
    return_data = {"rq_status": [], "mq_status": []}

    operational_uav = vehicles_qs.filter(status__in=[UASStatuses.FMC, UASStatuses.PMC])
    operational_uac = components_qs.filter(status__in=[UASStatuses.FMC, UASStatuses.PMC])

    operational_units = set(
        list(operational_uav.values_list("current_unit", flat=True))
        + list(operational_uac.values_list("current_unit", flat=True))
    )

    for unit in operational_units:
        current_uavs = operational_uav.filter(current_unit=unit)
        current_uacs = operational_uac.filter(current_unit=unit)

        mq_uac = current_uacs.filter(model__contains="Q-1")
        mq_uav = current_uavs.filter(model__contains="Q-1")

        mq_counts = {
            "GCS": mq_uac.filter(model__contains="GCS").count(),
            "GDT": mq_uac.filter(model__contains="GDT").count(),
            "SGDT": mq_uac.filter(model__contains="SGDT").count(),
            "UAV": mq_uav.count(),
        }

        # SGDT is included in GDT calculation; simple subtraction here instead of filering the GDT query set an additional time
        mq_counts["GDT"] -= mq_counts["SGDT"]

        mq_status = UASStatuses.FMC

        # Initialize the generic mq thresholds
        ## {"TYPE": [ <NMC <= VALUE>, <PMC <= VALUE> ]}
        ## GCS  - NMC <= 3; PMC <= 4        UAC
        ## GDT  - NMC <= 3; PMC <= 5        UAC
        ## SGDT - NMC <= 0; PMC <= 1        UAC
        ## UAV  - NMC <= 5; PMC <= 8        UAV
        mq_thresholds = {"GCS": [3, 4], "GDT": [3, 5], "SGDT": [0, 1], "UAV": [5, 8]}

        if len(mq_uac) > 0 or len(mq_uav) > 0:
            for model, thresholds in mq_thresholds.items():
                if mq_counts[model] <= thresholds[0]:
                    mq_status = UASStatuses.NMC
                elif mq_counts[model] <= thresholds[1]:
                    mq_status = UASStatuses.PMC if mq_status == UASStatuses.FMC else mq_status

            return_data["mq_status"].append({"current_unit": unit, "System Status": mq_status})

        rq_uac = current_uacs.filter(model__contains="Q-7")
        rq_uav = current_uavs.filter(model__contains="Q-7")

        rq_counts = {
            "GCS": rq_uac.filter(model__contains="GCS").count(),
            "GDT": rq_uac.filter(model__contains="GDT").count(),
            "TALS": rq_uac.filter(model__contains="TALS").count(),
            "LAU": rq_uac.filter(model__contains="LAU").count(),
            "UAV": rq_uav.count(),
        }

        rq_status = UASStatuses.FMC

        # Initialize the generic rq thresholds
        ## {"TYPE": [ <NMC <= VALUE>, <PMC <= VALUE> ]}
        ## GCS  - NMC <= 1; PMC <= NA       UAC
        ## GDT  - NMC <= 1; PMC <= NA       UAC
        ## TALS - NMC <= 0; PMC <= 1        UAC
        ## LAU  - NMC <= 0; PMC <= 1        UAC
        ## UAV  - NMC <= 1; PMC <= 2        UAV
        rq_thresholds = {"GCS": [1, -1], "GDT": [1, -1], "TALS": [0, 1], "LAU": [0, 1], "UAV": [1, 2]}

        if len(rq_uac) > 0 or len(rq_uav) > 0:
            for model, thresholds in rq_thresholds.items():
                if rq_counts[model] <= thresholds[0]:
                    rq_status = UASStatuses.NMC
                elif rq_counts[model] <= thresholds[1]:
                    rq_status = UASStatuses.PMC if rq_status == UASStatuses.FMC else rq_status

            return_data["rq_status"].append({"current_unit": unit, "System Status": rq_status})

    return JsonResponse(return_data, safe=False)
