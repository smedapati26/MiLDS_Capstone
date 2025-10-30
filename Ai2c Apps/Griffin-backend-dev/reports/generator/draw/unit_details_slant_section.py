import pandas as pd
from reportlab.pdfgen.canvas import Canvas

from reports.generator.draw.unit_details_slant_bank_time import draw_bank_time_slant
from reports.generator.draw.unit_details_slant_flight_hours import draw_flight_hours_slant
from reports.generator.draw.unit_details_slant_rtl import draw_rtl_slant
from reports.generator.draw.unit_details_slant_uas_status import draw_system_status_slant


def generate_dsr_slants(canvas: Canvas, dsr_dfs: list[pd.DataFrame], aircraft: bool = True):
    """
    Draws aircraft details table by:
    1. Creating a frame on the page

    @param canvas: (Canvas) the canvas to draw the header on
    @param dsr_dfs: ([pd.DataFrame]) The data to put into the table
    @param aircraft: (bool) a boolean flag indicating if the generated tables are for manned aircraft or UAS
    """
    canvas.saveState()
    if aircraft:
        slant_columns = ["serial", "model", "status", "rtl", "flight_hours", "hours_to_phase"]
        dsr_slant_df = pd.concat([dsr_df[slant_columns] for dsr_df in dsr_dfs])
        draw_bank_time_slant(canvas, dsr_slant_df)
    else:
        slant_columns = ["serial_number", "model", "status", "rtl", "flight_hours"]
        dsr_slant_df = pd.concat([dsr_df[dsr_df.type == "vehicle"][slant_columns] for dsr_df in dsr_dfs])
        # draw_system_status_slant(canvas, dsr_slant_df)
    draw_rtl_slant(canvas, dsr_slant_df)
    draw_flight_hours_slant(canvas, dsr_slant_df)
    canvas.restoreState()
