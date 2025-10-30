from datetime import datetime

from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from faults.models import Fault, FaultAction
from personnel.models import Soldier
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST


@require_GET
def get_earliest_maintainer_fault(request: HttpRequest, user_id: str):
    """
    Given a soldiers dodid, return the discovery date of the earliest fault they are related to
    """
    try:  # to get the soldier requested
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    fault_ids = set(
        FaultAction.objects.filter(maintainerfaultaction__soldier=soldier).values_list("associated_fault_id", flat=True)
    )

    earliest_fault = Fault.objects.filter(id__in=fault_ids).order_by("discovery_date_time").first()

    earliest_fault_date = earliest_fault.discovery_date_time if earliest_fault else datetime.today()

    return JsonResponse({"earliest_fault_date": earliest_fault_date})
