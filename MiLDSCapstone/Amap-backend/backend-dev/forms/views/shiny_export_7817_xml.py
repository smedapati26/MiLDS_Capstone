from django.http import HttpRequest, HttpResponseNotFound, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
import math
import zipfile
import io
import xml.etree.ElementTree as et

from forms.models import DA_7817, EventTasks
from personnel.models import Soldier
from forms.model_utils import EventType as OldEventType

from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST
from utils.logging import log_api_call


@csrf_exempt
@require_GET
@log_api_call
def shiny_export_7817_xml(request: HttpRequest, dod_id: str):
    """

    @param request : (django.http.HttpRequest) the request object
    @param dod : (str) the Soldier's DOD ID number to export a 7817 XML for
    """
    # Get Soldier whose XML 7817 data is requested
    try:
        soldier = Soldier.objects.get(user_id=dod_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    # Get Soldier 7817 Records
    records = DA_7817.objects.filter(soldier=soldier, event_deleted=False).order_by("date")

    # For every 23 Soldier Event Records:
    total_xml_files = math.ceil(records.count() / 23)
    # Make temporary directory to store XML files
    zip_buffer = io.BytesIO(b"")

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for x in range(total_xml_files):
            # Create xml tree from empty Da7817 .xml document
            tree = et.parse("static/xml/BLANK_DA_FORM_7817_data.xml")
            root = tree.getroot()

            # Populate First Sheet Soldier info fields
            mos = root.findall(".//MOS")  # Handle odd case of misnamed field for MOS
            mos[0].text = soldier.primary_mos.mos
            mos[1].text = soldier.user_id

            root.find(".//Name").text = soldier.rank + " " + soldier.first_name + " " + soldier.last_name
            root.find(".//Rank1").text = "PV2"
            root.find(".//Rank2").text = "PFC"
            root.find(".//Rank3").text = "SPC"
            root.find(".//Rank4").text = "SGT"
            root.find(".//Rank5").text = "SSG"
            root.find(".//Rank6").text = "SFC"
            root.find(".//Date_Rank1").text = str(soldier.pv2_dor)
            root.find(".//Date_Rank2").text = str(soldier.pfc_dor)
            root.find(".//Date_Rank3").text = str(soldier.spc_dor)
            root.find(".//Date_Rank4").text = str(soldier.sgt_dor)
            root.find(".//Date_Rank5").text = str(soldier.ssg_dor)
            root.find(".//Date_Rank6").text = str(soldier.sfc_dor)
            sheet_no1 = root.findall(".//Sheet_Number1")
            sheet_no1[0].text = str(x + 1)
            sheet_no1[1].text = str(x + 1)
            sheet_no2 = root.findall(".//Sheet_Number2")
            sheet_no2[0].text = str(total_xml_files)
            sheet_no2[1].text = str(total_xml_files)
            # Second Sheet Soldier Info fields
            root.find(".//Rank").text = soldier.rank

            event_counter = 1
            backside_counter = 1
            go_nogo_map = {"GO": "1", "NOGO": "2", "N/A": "3"}

            slice_start = x * 23
            slice_end = (x + 1) * 23

            amap_tag = "A-MAP | "
            for record in records[slice_start:slice_end]:
                root.find(".//Date" + str(event_counter)).text = str(record.date)
                associated_tasks = EventTasks.objects.filter(event=record)
                frontside_remarks = ""
                backside_remarks = ""
                event_info = ""

                if record.event_type.type == OldEventType.Training:
                    event_info = "[Training - " + record.training_type.type + "] "
                elif record.event_type.type == OldEventType.Evaluation:
                    event_info = "[Evaluation - " + record.evaluation_type.type + "] "
                elif record.event_type.type == OldEventType.Award:
                    event_info = "[Award - " + record.award_type.type + "] "
                elif record.event_type.type == OldEventType.Other:
                    event_info = "[Other] "
                elif record.event_type.type == OldEventType.LAO:
                    event_info = "[Local Area Orientation] "
                elif record.event_type.type == OldEventType.PCSorETS:
                    event_info = (
                        "[PCS/ETS - Gaining Unit - "
                        + (record.gaining_unit.short_name if record.gaining_unit else "N/A")
                        + "] "
                    )
                elif record.event_type.type == OldEventType.InUnitTransfer:
                    event_info = (
                        "[In-Unit Transfer - Gaining Unit - "
                        + (record.gaining_unit.short_name if record.gaining_unit else "N/A")
                        + "] "
                    )
                elif record.event_type.type == OldEventType.TCS:
                    event_info = "[TCS - TCS Location - " + record.tcs_location.location + "] "
                elif record.event_type.type == OldEventType.RecordsReview:
                    event_info = "[Records Review] "

                mmh = ""
                if (record.total_mx_hours != None) & (record.total_mx_hours != 0):
                    mmh = " [" + str(record.total_mx_hours) + " MMH]"

                if record.comment and len(record.comment.split(" (Additional Remarks) -> ")) > 1:
                    full_comment = record.comment.split(" (Additional Remarks) -> ")
                    frontside_remarks = amap_tag + event_info + full_comment[0] + mmh
                    backside_remarks = full_comment[1] + ". "
                else:
                    if record.comment:
                        comment_remark = record.comment
                    else:
                        comment_remark = ""
                    frontside_remarks = amap_tag + event_info + comment_remark + mmh

                root.find(".//Event" + str(event_counter)).text = frontside_remarks

                if len(associated_tasks) > 0:
                    if record.event_type.type == OldEventType.Training:
                        task_prefix = "Trained on "
                    else:
                        task_prefix = "Evaluated on "
                    if len(associated_tasks) == 1:
                        tasks = "Task: "
                    else:
                        tasks = "Tasks: "
                    for task in associated_tasks:
                        tasks = tasks + task.task.task_number + ", "
                    backside_remarks = backside_remarks + task_prefix + tasks
                    backside_remarks = backside_remarks.rstrip(", ")

                if record.recorded_by != None:
                    recorder = (
                        record.recorded_by.rank
                        + " "
                        + record.recorded_by.first_name
                        + " "
                        + record.recorded_by.last_name
                    )
                    recorder_initials = record.recorded_by.first_name[0] + record.recorded_by.last_name[0]
                elif record.recorded_by_legacy != None and len(record.recorded_by_legacy) > 0:
                    recorder = record.recorded_by_legacy
                    legacy_rank_initial = record.recorded_by_legacy[0]
                    try:
                        legacy_last_name_initial = record.recorded_by_legacy.split()[1][0]
                    except IndexError:
                        legacy_last_name_initial = ""
                    recorder_initials = legacy_rank_initial + legacy_last_name_initial
                else:
                    recorder = "N/A"
                    recorder_initials = "N/A"

                if backside_remarks != "":
                    root.find(".//Date_" + str(backside_counter)).text = str(record.date)
                    root.find(".//Maintainer_Initials" + str(backside_counter)).text = (
                        soldier.first_name[0] + soldier.last_name[0]
                    )
                    root.find(".//Recorded_By_" + str(backside_counter)).text = recorder_initials
                    root.find(".//Remarks_" + str(backside_counter)).text = backside_remarks
                    backside_counter += 1

                root.find(".//Recorded_By" + str(event_counter)).text = recorder
                root.find(".//Initials" + str(event_counter)).text = soldier.first_name[0] + soldier.last_name[0]
                if record.go_nogo:
                    root.find(".//group" + str(event_counter)).text = go_nogo_map[record.go_nogo]
                event_counter += 1

            xml_bytes = et.tostring(
                root, encoding="UTF-8", xml_declaration=True, method="xml", short_empty_elements=False
            )

            # Write a blank legacy DA7817 to the zip along with the xml data to fill it
            zip_file.write("static/pdf/BLANK_DA_FORM_7817.pdf", f"BLANK_DA7817_Page_{x + 1}.pdf")

            zip_file.writestr(f"{soldier.first_name}_{soldier.last_name}_DA7817_Data_Page_{x + 1}.xml", xml_bytes)

    # Seek to the beginning of the buffer
    zip_buffer.seek(0)

    return FileResponse(
        zip_buffer, as_attachment=True, filename="{}_{}_7817_Records.zip".format(soldier.first_name, soldier.last_name)
    )
