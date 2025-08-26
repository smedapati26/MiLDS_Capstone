from django.http import HttpRequest, FileResponse
from django.views.decorators.http import require_http_methods
import zipfile
import io
import re
import pandas as pd

from forms.models import SupportingDocument, DA_4856, DA_7817
from forms.views import shiny_export_7817_xml
from personnel.models import Soldier
from personnel.utils import get_soldier_uctl_and_ictl_dataframes

from utils.logging import log_api_call


@require_http_methods(["GET"])
def shiny_amap_packet(request: HttpRequest):
    """
    Retrieves all relevant and queried AMAP documents based on the soldiers passed in.

    @param request: (HttpRequest)
        - The request headers must be structured as follows:
        ?soldier_id=(valid soldier_id)
        &soldier_id=(valid soldier_id) OPTIONAL FOR MORE SOLDIERS PACKETS TO BE RETURNED
        &ictl=(boolean for including ictl tasks)
        &uctl=(boolean for including USAACE tasks)
        &da_4856=(boolean for including DA 4856 data)
        &da_7817=(boolean for including DA 7817 data)
        &supporting_documents=(boolean for including Supporting Document data)

    @returns (FileResponse) A zip file containing all the requested data for the passed in soldiers.
    """
    # Get the soldier ids
    soldier_list = request.GET.getlist("soldier_id")

    # Get the other request headers or default them to False
    include_ictl = request.GET.get("ictl", "FALSE").upper() == "TRUE"
    include_uctl = request.GET.get("uctl", "FALSE").upper() == "TRUE"
    include_da_4856 = request.GET.get("da_4856", "FALSE").upper() == "TRUE"
    include_da_7817 = request.GET.get("da_7817", "FALSE").upper() == "TRUE"
    include_supporting_documents = request.GET.get("supporting_documents", "FALSE").upper() == "TRUE"

    queried_soldiers = Soldier.objects.filter(user_id__in=soldier_list)

    # Create zip buffer to write files to
    unit_zip_buffer = io.BytesIO(b"")

    with zipfile.ZipFile(unit_zip_buffer, "w", zipfile.ZIP_DEFLATED) as unit_zip:
        for soldier in queried_soldiers:
            # Get the required documents for each soldier
            if include_supporting_documents:
                soldier_supporting_documents = SupportingDocument.objects.filter(soldier=soldier)
            else:
                soldier_supporting_documents = []

            if include_da_4856:
                soldier_da_4856s = DA_4856.objects.filter(soldier=soldier)
            else:
                soldier_da_4856s = []

            if include_da_7817:
                soldier_7817s = DA_7817.objects.filter(soldier=soldier, event_deleted=False)
            else:
                soldier_7817s = []

            if include_uctl or include_ictl:
                usaace_ictl_df, unit_uctl_df = get_soldier_uctl_and_ictl_dataframes(soldier)
            else:
                usaace_ictl_df, unit_uctl_df = [], []

            # Initialize the Naming for the soldier folder
            soldier_folder = "{}/".format(soldier.name_and_rank())

            # Check to see if the requested data is valid by existing and being requested
            valid_supporting_documents = len(soldier_supporting_documents) > 0 and include_supporting_documents
            valid_da_4856 = len(soldier_da_4856s) > 0 and include_da_4856
            valid_da_7817 = len(soldier_7817s) > 0 and include_da_7817
            valid_usaace_ictl = len(usaace_ictl_df) > 0 and include_ictl
            valid_unit_uctl = len(unit_uctl_df) > 0 and include_uctl

            # Check to see if this soldier is valid to have any processing done for their AMAP Digital Packet
            valid_soldier = (
                valid_supporting_documents or valid_da_4856 or valid_da_7817 or valid_usaace_ictl or valid_unit_uctl
            )

            if valid_soldier:
                # Initialize the soldier's folder
                unit_zip.writestr(soldier_folder, "")

                if valid_supporting_documents:
                    # Initalize the soldier's Supporting Document folder
                    soldier_supporting_documnet_folder = "{}Supporting Documents/".format(soldier_folder)
                    unit_zip.writestr(soldier_supporting_documnet_folder, "")

                    for supporting_document in soldier_supporting_documents:
                        supporting_doc_title = "{}{}".format(
                            soldier_supporting_documnet_folder,
                            supporting_document.document_title,
                        )

                        if supporting_document.document != None:
                            try:
                                with supporting_document.document.open("rb") as myfile:
                                    unit_zip.writestr(supporting_doc_title, myfile.read())
                            except ValueError:
                                unit_zip.writestr(supporting_doc_title + ".txt", "ERROR ON RETRIEVING FILE")

                if valid_da_4856:
                    # Initalize the soldier's DA 4856 folder
                    soldier_da_4856_folder = "{}DA 4856s/".format(soldier_folder)
                    unit_zip.writestr(soldier_da_4856_folder, "")

                    for da_4856 in soldier_da_4856s:
                        da_4856_doc_title = "{}{}.pdf".format(soldier_da_4856_folder, da_4856.title)

                        try:
                            if da_4856.document != None:
                                with da_4856.document.open("rb") as myfile:
                                    unit_zip.writestr(da_4856_doc_title, myfile.read())
                        except ValueError:
                            unit_zip.writestr(da_4856_doc_title + ".txt", "ERROR ON RETRIEVING FILE")

                if valid_da_7817:
                    # Initalize the soldier's 7817 folder
                    soldier_da_7817_folder = "{}DA 7817s/".format(soldier_folder)
                    unit_zip.writestr(soldier_da_7817_folder, "")
                    soldier_7817_export_response = shiny_export_7817_xml(request=request, dod_id=soldier.user_id)
                    soldier_7817_buffer = io.BytesIO(soldier_7817_export_response.getvalue())

                    with zipfile.ZipFile(soldier_7817_buffer, "r") as soldier_7817_zip:
                        for soldier_7817 in soldier_7817_zip.infolist():
                            soldier_7817_title = "{}{}".format(soldier_da_7817_folder, soldier_7817.filename)
                            soldier_7817_data = soldier_7817_zip.read(soldier_7817.filename)
                            unit_zip.writestr(soldier_7817_title, soldier_7817_data)

                if valid_usaace_ictl or valid_unit_uctl:
                    # Initalize the soldier's Task List folder
                    task_list_folder = "{}Critical Task Lists/".format(soldier_folder)
                    unit_zip.writestr(task_list_folder, "")

                    if valid_usaace_ictl:
                        usaace_buffer = io.BytesIO()

                        usaace_grouped_dfs = usaace_ictl_df.groupby("ictl__ictl_title")

                        with pd.ExcelWriter(usaace_buffer, engine="xlsxwriter") as excel_writer:
                            for usaace_group_name, usaace_group_data in usaace_grouped_dfs:
                                usaace_group_data = usaace_group_data.drop(
                                    columns=["ictl__ictl_title", "ictl__unit", "ictl__unit__short_name"]
                                )

                                if len(usaace_group_name) > 31 and usaace_group_name.__contains__("SHARED"):
                                    usaace_group_name = usaace_group_name[
                                        : usaace_group_name.index("SHARED") + len("SHARED")
                                    ]
                                    if len(usaace_group_name) > 31:
                                        usaace_group_name = usaace_group_name[:31]
                                elif len(usaace_group_name) > 31:
                                    usaace_group_name = usaace_group_name[:31]

                                usaace_group_sheet_name = re.sub(r"[\[\]\:\*\?/\"]", "-", str(usaace_group_name))

                                usaace_group_data.to_excel(
                                    excel_writer, sheet_name=str(usaace_group_sheet_name), index=False
                                )

                            workbook = excel_writer.book
                            for worksheet in workbook.worksheets():
                                worksheet.autofit()

                        usaace_buffer.seek(0)

                        usaace_list_file_name = "{}USAACE Task Lists.xlsx".format(task_list_folder)
                        unit_zip.writestr(usaace_list_file_name, usaace_buffer.getvalue())

                    if valid_unit_uctl:
                        unit_list_buffer = io.BytesIO()

                        unit_grouped_dfs = unit_uctl_df.groupby("ictl__ictl_title")

                        with pd.ExcelWriter(unit_list_buffer, engine="xlsxwriter") as excel_writer:
                            for unit_group_name, unit_group_data in unit_grouped_dfs:
                                unit_group_data = unit_group_data.drop(
                                    columns=["ictl__ictl_title", "ictl__unit", "ictl__unit__short_name"]
                                )

                                if len(unit_group_name) > 31 and unit_group_name.__contains__("SHARED"):
                                    unit_group_name = unit_group_name[: unit_group_name.index("SHARED") + len("SHARED")]
                                    if len(unit_group_name) > 31:
                                        unit_group_name = unit_group_name[:31]
                                elif len(unit_group_name) > 31:
                                    unit_group_name = unit_group_name[:31]

                                unit_group_sheet_name = re.sub(r"[\[\]\:\*\?/\"]", "-", str(unit_group_name))

                                unit_group_data.to_excel(excel_writer, sheet_name=unit_group_sheet_name, index=False)

                            workbook = excel_writer.book
                            for worksheet in workbook.worksheets():
                                worksheet.autofit()

                        unit_list_buffer.seek(0)

                        unit_list_file_name = "{}Unit Task Lists.xlsx".format(task_list_folder)
                        unit_zip.writestr(unit_list_file_name, unit_list_buffer.getvalue())

    unit_zip_buffer.seek(0)

    return FileResponse(
        unit_zip_buffer, as_attachment=True, filename="AMTP Digital Packet.zip", content_type="application/zip"
    )
