import json
from datetime import datetime

from django.db.utils import IntegrityError
from django.http import HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from personnel.models import Designation, Soldier, SoldierDesignation
from units.models import Unit
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)


@require_http_methods(["POST"])
def create_soldier_designation(request: HttpRequest):
    """
    Creates a new SoldierDesignation object.

    @param request (HttpRequest): The calling request object
        - Request body must be formatted as follows:
        {
            "soldier": (str) the Soldier DOD id that the Soldier Designation is being created for,
            "designation": (str) the type value of the Designation object the Soldier Designation is being set to,
            "unit": (str) the UIC value of the Unit the Soldier Designation is being set to,
            "start_date": (str) Start Date,
            "end_date": (str) End Date,
            "last_modified_by": (str) The DOD id of the Soldier creating this designation,
            "designation_removed": (bool) boolean indicating if this Soldier Designation is "deleted" or not
        }

    @returns (HttpResponse | HttpResponseBadRequest)
    """
    # Retrieve Request/Query Data
    # ---------------------------
    data: dict = json.loads(request.body)

    last_modified_by = data.get("last_modified_by", None)

    valid_creation_data = {}
    # Query/Create Django Models
    # ---------------------------
    try:
        soldier_id = data["soldier"]
        soldier = Soldier.objects.get(user_id=soldier_id)
        valid_creation_data["soldier"] = soldier
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    try:
        designation_type = data["designation"]
        designation = Designation.objects.get(type=designation_type)
        valid_creation_data["designation"] = designation
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except:
        return HttpResponseNotFound("Designation does not exist.")

    try:
        designation_unit = data["unit"]
        unit = Unit.objects.get(uic=designation_unit)
        valid_creation_data["unit"] = unit
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    if last_modified_by:
        try:
            last_modified_soldier = Soldier.objects.get(user_id=last_modified_by)
            valid_creation_data["last_modified_by"] = last_modified_soldier
        except:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    valid_creation_data["start_date"] = data.get("start_date", datetime.now(tz=timezone.utc).replace(microsecond=0))
    valid_creation_data["end_date"] = data.get("end_date", None)
    valid_creation_data["designation_removed"] = data.get("designation_removed", False)

    try:
        designation = SoldierDesignation.objects.create(**valid_creation_data)
    except IntegrityError:
        return HttpResponseServerError("Soldier Designation could not be created")

    # Build Return Data
    # ---------------------------
    return_message = "SoldierDesignation successfully created."

    # Return Response
    # ---------------------------
    return JsonResponse({"designation_id": designation.id})
