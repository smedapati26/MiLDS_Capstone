from django.http import HttpRequest, FileResponse
from django.views.decorators.http import require_GET
from datetime import datetime
import pandas as pd
import json
from io import BytesIO

from utils.logging import log_api_call
from personnel.views import shiny_get_unit_summary


@require_GET
@log_api_call
def shiny_export_unit_summary(request: HttpRequest, uic: str, expand: str, summarize_by: str, full_report: str):
    """
    Returns an excel file with summary breakdown of AMTP status per Unit and MOS (by = "Both"),
    just by Unit (by = "Unit") or just by MOS (by = "MOS"), which is retrieved from the shiny_get_unit_summary view

    If full_report is True, returns all 5 Different unique combinations of reports, else returns just the requested report

    """
    date = datetime.today().strftime("%d%b%y").upper()
    excel_file = BytesIO()
    xlwriter = pd.ExcelWriter(excel_file, engine="xlsxwriter")

    # If not full report, return specific report requested
    if full_report == "False":
        specific_summary_df = pd.DataFrame(
            json.loads(shiny_get_unit_summary(request, uic, expand, summarize_by).content.decode("utf-8")).pop(
                "summary", None
            )
        )
        specific_summary_df.to_excel(xlwriter, sheet_name="AMTP_Summary", index=False)
        if summarize_by == "Both":
            summarize = "UnitMOS"
        else:
            summarize = summarize_by
        if expand == "True":
            expanded = "Expanded"
        else:
            expanded = "Non_Expanded"
        file_name = "{}_AMTP_{}_Summary_{}.xlsx".format(uic, summarize, expanded, date)

    # If full report, return all 3 reports for non-expanded unit structure, 2 for expanded unit structure
    # Each report will have it's own sheet in the Excel
    else:
        unit_summary_non_expanded_df = pd.DataFrame(
            json.loads(shiny_get_unit_summary(request, uic, "False", "Unit").content.decode("utf-8")).pop(
                "summary", None
            )
        )
        unit_mos_summary_non_expanded_df = pd.DataFrame(
            json.loads(shiny_get_unit_summary(request, uic, "False", "Both").content.decode("utf-8")).pop(
                "summary", None
            )
        )
        mos_summary_non_expanded_df = pd.DataFrame(
            json.loads(shiny_get_unit_summary(request, uic, "False", "MOS").content.decode("utf-8")).pop(
                "summary", None
            )
        )
        unit_summary_expanded_df = pd.DataFrame(
            json.loads(shiny_get_unit_summary(request, uic, "True", "Unit").content.decode("utf-8")).pop(
                "summary", None
            )
        )
        unit_mos_summary_expanded_df = pd.DataFrame(
            json.loads(shiny_get_unit_summary(request, uic, "True", "Both").content.decode("utf-8")).pop(
                "summary", None
            )
        )

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
