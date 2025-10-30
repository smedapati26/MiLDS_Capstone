import json

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from personnel.models import Designation, Soldier, SoldierDesignation
from units.models import Unit
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST, HTTP_404_UNIT_DOES_NOT_EXIST


@require_http_methods(["PUT"])
def update_soldier_designation(request: HttpRequest, id):
    """
    Updates an existing SoldierDesignation object.

    @param request (HttpRequest): The calling request object
        - Request body must be formatted as follows:
            {
                "designation": (str) the type value of the Designation object the Soldier Designation is being set to,
                "unit": (str) the UIC value of the Unit the Soldier Designation is being set to,
                "start_date": (str) Start Date,
                "end_date": (str) End Date,
                "last_modified_by": (str) The DOD id of the Soldier last modifying this Soldier Designation,
                "designation_removed": (bool) boolean indicating if this Soldier Designation is "deleted" or not
            }
    @param id (int): The SoldierDesignation primary key

    @returns (HttpResponse | HttpResponseNotFound)
    """
    # Retrieve Request/Query Data
    # ---------------------------
    data: dict = json.loads(request.body)

    designation_type = data.get("designation", None)
    designation_unit = data.get("unit", None)
    last_modified_by = data.get("last_modified_by", None)

    valid_update_data = {}
    valid_update_keys = {"start_date", "end_date", "designation_removed"}

    # Query Django Models
    # ---------------------------
    try:
        soldier_designation = SoldierDesignation.objects.get(id=id)
    except SoldierDesignation.DoesNotExist:
        return HttpResponseNotFound("SoldierDesignation does not exist.")

    if designation_type:
        try:
            designation = Designation.objects.get(type=designation_type)
            valid_update_data["designation"] = designation
        except:
            return HttpResponseNotFound("Designation does not exist.")

    if designation_unit:
        try:
            unit = Unit.objects.get(uic=designation_unit)
            valid_update_data["unit"] = unit
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    if last_modified_by:
        try:
            last_modified_soldier = Soldier.objects.get(user_id=last_modified_by)
            valid_update_data["last_modified_by"] = last_modified_soldier
        except:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    # Manipulate Models and Data
    # ---------------------------
    for key, value in data.items():
        if key in valid_update_keys:
            valid_update_data[key] = value

    for field, value in valid_update_data.items():
        setattr(soldier_designation, field, value)

    soldier_designation.save(update_fields=valid_update_data.keys())

    # Return Response
    # ---------------------------
    return HttpResponse("SoldierDesignation updated.")
