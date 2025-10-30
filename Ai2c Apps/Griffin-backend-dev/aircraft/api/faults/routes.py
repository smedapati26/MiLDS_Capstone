from datetime import date, datetime, time
from typing import List

from django.db.models import Count
from django.http import HttpRequest
from django.utils.timezone import make_aware
from ninja import Router

from aircraft.api.faults.schema import FaultsOverTimeSchema
from aircraft.models import Fault
from auto_dsr.models import Unit
from utils.time import get_reporting_periods

faults_router = Router()


######## Faults ########
@faults_router.get("/faults-over-time", response=List[FaultsOverTimeSchema], summary="Faults Over Time")
def faults_over_time(request: HttpRequest, uic: str, start_date: date, end_date: date):
    """
    Return a list of faults per UIC over time.

    """
    period_dates = get_reporting_periods(start_date, end_date)
    serialized_data = []
    uics = Unit.objects.get(uic=uic).subordinate_unit_hierarchy(include_self=True)
    for range_start, range_end in period_dates:
        filters = {
            "unit__uic__in": uics,
            "discovery_date_time__range": (
                make_aware(datetime.combine(range_start, time(0, 0, 0))),
                make_aware(datetime.combine(range_end, time(23, 59, 59))),
            ),
        }
        found_faults = list(
            Fault.objects.filter(**filters).values("status_code_value").annotate(count=Count("status_code_value"))
        )
        return_data = FaultsOverTimeSchema(reporting_period=range_end)
        if len(found_faults) > 0:
            for row in found_faults:
                match row["status_code_value"]:
                    case Fault.TechnicalStatus.NO_STATUS:
                        setattr(return_data, "no_status", row["count"])
                    case Fault.TechnicalStatus.CLEARED:
                        setattr(return_data, "cleared", row["count"])
                    case Fault.TechnicalStatus.TI_CLEARED:
                        setattr(return_data, "ti_cleared", row["count"])
                    case Fault.TechnicalStatus.DIAGONAL:
                        setattr(return_data, "diagonal", row["count"])
                    case Fault.TechnicalStatus.DASH:
                        setattr(return_data, "dash", row["count"])
                    case Fault.TechnicalStatus.ADMIN_DEADLINE:
                        setattr(return_data, "admin_deadline", row["count"])
                    case Fault.TechnicalStatus.DEADLINE:
                        setattr(return_data, "deadline", row["count"])
                    case Fault.TechnicalStatus.CIRCLE_X:
                        setattr(return_data, "circle_x", row["count"])
                    case Fault.TechnicalStatus.NUCLEAR:
                        setattr(return_data, "nuclear", row["count"])
                    case Fault.TechnicalStatus.CHEMICAL:
                        setattr(return_data, "chemical", row["count"])
                    case Fault.TechnicalStatus.BIOLOGICAL:
                        setattr(return_data, "biological", row["count"])
        serialized_data.append(return_data)

    return sorted(serialized_data, key=lambda x: x.reporting_period)
