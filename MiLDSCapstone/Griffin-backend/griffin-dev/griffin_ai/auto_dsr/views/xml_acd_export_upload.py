from django.utils import timezone
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.http import require_POST
from http import HTTPStatus
import xml.etree.ElementTree as ET
import pandas as pd
from datetime import datetime

from auto_dsr.models import Unit, User, ACDExport
from auto_dsr.utils.acd_export.update_1352_xml import update_1352s
from utils.http import (
    get_user_id,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_FILE,
)


@require_POST
def xml_acd_export_upload(request: HttpRequest) -> HttpResponse:
    """
    Handles updating all 1352 records contained within an XML export upload

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic of the unit selected when the file was uploaded
    """
    shiny_upload = request.headers["User-Agent"].startswith("libcurl")

    try:  # to get the user uploading the export
        if shiny_upload:
            user_id = request.headers.get("X-On-Behalf-Of", None)
            user = User.objects.get(user_id=user_id)
        else:  # Uploaded directly from small upload link
            user_id = get_user_id(request.headers)
            user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST}, status=HTTPStatus.NOT_FOUND)
    except KeyError:
        return JsonResponse(
            {"error": "Improperly formatted request, no user id passed in headers."}, status=HTTPStatus.BAD_REQUEST
        )

    try:  # to get the unit being updated by the export
        unit = Unit.objects.get(uic=request.POST.get("unit"))
    except Unit.DoesNotExist:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST}, status=HTTPStatus.NOT_FOUND)

    dsr_export_time = timezone.now().replace(microsecond=0)
    export = ACDExport.objects.create(unit=unit, user=user, uploaded_at=dsr_export_time, upload_type="xml")

    try:  # to get the export from the request
        export_file = request.FILES["acd_export"]
        export.document = export_file
        export.save()
    except KeyError:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_NO_FILE}, status=HTTPStatus.BAD_REQUEST)

    try:
        tree = ET.parse(export.document)
        root = tree.getroot()

        # parse readiness period and convert to datetime object
        period = root.find("PeriodEnding").text
        format = "%Y-%m-%d"
        readiness_period = datetime.strptime(period[0:10], format)

        # parse aircraft and hours into df
        da_1352_dict = {}
        for subordinate_unit in root.findall("ReportingOrganization"):
            uic = subordinate_unit.find("ReportingUicDuic").text
            for aircraft in subordinate_unit.findall("ReportingItem"):
                aircraft_serial = aircraft.find("AircraftComponentSerialNumber").text
                da_1352_dict[aircraft_serial] = {}
                da_1352_dict[aircraft_serial]["current_uic"] = uic
                da_1352_dict[aircraft_serial]["Flying Hours"] = float(aircraft.find("FlyingHours").text)
                da_1352_dict[aircraft_serial]["Total Hours"] = float(aircraft.find("HoursOnHand").text)
                da_1352_dict[aircraft_serial]["FMC"] = float(aircraft.find("FullyMissionCapableHours").text)
                da_1352_dict[aircraft_serial]["PMCM"] = float(
                    aircraft.find("PartiallyMissionCapableMaintenanceHours").text
                )
                da_1352_dict[aircraft_serial]["PMCS"] = float(aircraft.find("PartiallyMissionCapableSupplyHours").text)
                da_1352_dict[aircraft_serial]["NMCS"] = float(aircraft.find("NonMissionCapableSupplyHours").text)
                da_1352_dict[aircraft_serial]["SUST"] = float(aircraft.find("SustainmentHours").text)
                da_1352_dict[aircraft_serial]["FIELD"] = float(aircraft.find("FieldHours").text)
                da_1352_dict[aircraft_serial]["NMCM"] = (
                    da_1352_dict[aircraft_serial]["SUST"] + da_1352_dict[aircraft_serial]["FIELD"]
                )
                da_1352_dict[aircraft_serial]["DADE"] = float(aircraft.find("DepartmentArmyDirectedEventHours").text)
                da_1352_dict[aircraft_serial]["Reportable Hours"] = (
                    da_1352_dict[aircraft_serial]["Total Hours"] - da_1352_dict[aircraft_serial]["DADE"]
                )
        readiness_status_df = pd.DataFrame.from_dict(da_1352_dict, orient="index")

    except:
        return JsonResponse(
            {"error": "Failed To Read XML. Please ensure it is in the correct format."},
            status=HTTPStatus.BAD_REQUEST,
        )

    try:
        update_1352s(readiness_status_df, readiness_period)
    except:
        return HttpResponse("Read File - 1352 Update Failed")

    return HttpResponse("Read File")
