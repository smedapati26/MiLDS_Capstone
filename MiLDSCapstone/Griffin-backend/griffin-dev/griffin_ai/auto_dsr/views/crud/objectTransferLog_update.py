from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
import json

from auto_dsr.models import ObjectTransferLog

from utils.http.constants import HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST


@require_http_methods(["PUT"])
def update_object_transfer_log(request: HttpRequest, transfer_log_id: int):
    """
    Reads an existing Object Transfer Request Log object.

    @param request: (HttpRequest)
        - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "permanent_transfer": (bool)
            "date_requested": (Date)
            "decision_date": (Date | None)
            "transfer_approved": (Bool)
        }

    @returns (HttpResponse | HttpResponseNotFound)
    """

    data = json.loads(request.body)
    data = {} if isinstance(data, list) else data

    try:
        transfer_object_log = ObjectTransferLog.objects.get(id=transfer_log_id)
    except ObjectTransferLog.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST)

    transfer_object_log.date_requested = data.get("date_requested", transfer_object_log.date_requested)

    transfer_object_log.decision_date = data.get("decision_date", transfer_object_log.decision_date)

    transfer_object_log.permanent_transfer = data.get("permanent_transfer", transfer_object_log.permanent_transfer)

    transfer_object_log.transfer_approved = data.get("transfer_approved", transfer_object_log.transfer_approved)

    transfer_object_log.save(update_fields=data.keys())

    return HttpResponse("Object Transfer Log successfully updated.")
