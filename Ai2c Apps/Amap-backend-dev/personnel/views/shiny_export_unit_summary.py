import json
from datetime import datetime
from io import BytesIO

import pandas as pd
from django.http import FileResponse, HttpRequest, HttpResponseNotFound
from django.views.decorators.http import require_GET

from personnel.utils import get_unit_summary
from units.models import Unit
from utils.http.constants import HTTP_404_UNIT_DOES_NOT_EXIST


@require_GET
def shiny_export_unit_summary(request: HttpRequest, uic: str, expand: str, summarize_by: str, full_report: str):
    """
    Returns an excel file with summary breakdown of AMTP status per Unit and MOS (by = "Both"),
    just by Unit (by = "Unit") or just by MOS (by = "MOS"), which is retrieved from the shiny_get_unit_summary view

    If full_report is True, returns all 5 Different unique combinations of reports, else returns just the requested report

    """
    try:  # to get the unit requested
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    date = datetime.today().strftime("%d%b%y").upper()
    excel_file = BytesIO()
    xlwriter = pd.ExcelWriter(excel_file, engine="xlsxwriter")

    # If not full report, return specific report requested
    if full_report == "False":
        specific_summary_df = pd.DataFrame(get_unit_summary(unit, expand, summarize_by))
        specific_summary_df.to_excel(xlwriter, sheet_name="AMTP_Summary", index=False)
        if summarize_by == "Both":
            summarize = "UnitMOS"
        else:
            summarize = summarize_by
        if expand == "True":
            expanded = "Expanded"
        else:
            expanded = "Non_Expanded"
        file_name = "{}_AMTP_{}_Summary_{}_{}.xlsx".format(uic, summarize, expanded, date)

    # If full report, return all 3 reports for non-expanded unit structure, 2 for expanded unit structure
    # Each report will have it's own sheet in the Excel
    else:
        unit_summary_non_expanded_df = pd.DataFrame(get_unit_summary(unit, "False", "Unit"))
        unit_mos_summary_non_expanded_df = pd.DataFrame(get_unit_summary(unit, "False", "Both"))
        mos_summary_non_expanded_df = pd.DataFrame(get_unit_summary(unit, "False", "MOS"))
        unit_summary_expanded_df = pd.DataFrame(get_unit_summary(unit, "True", "Unit"))
        unit_mos_summary_expanded_df = pd.DataFrame(get_unit_summary(unit, "True", "Both"))

        unit_summary_non_expanded_df.to_excel(xlwriter, sheet_name="Unit Summary (Non-Expanded)", index=False)
        unit_mos_summary_non_expanded_df.to_excel(xlwriter, sheet_name="Unit MOS Summary (Non-Expanded)", index=False)
        mos_summary_non_expanded_df.to_excel(xlwriter, sheet_name="MOS Summary (Non-Expanded)", index=False)
        unit_summary_expanded_df.to_excel(xlwriter, sheet_name="Unit Summary (Expanded)", index=False)
        unit_mos_summary_expanded_df.to_excel(xlwriter, sheet_name="Unit MOS Summary (Expanded)", index=False)

        file_name = "{}_AMTP_Summary_{}.xlsx".format(uic, date)

    # Autofit columns in sheets to fit width
    workbook = xlwriter.book
    for worksheet in workbook.worksheets():
        worksheet.autofit()

    xlwriter.close()
    excel_file.seek(0)
    return FileResponse(excel_file, as_attachment=True, filename=file_name)
