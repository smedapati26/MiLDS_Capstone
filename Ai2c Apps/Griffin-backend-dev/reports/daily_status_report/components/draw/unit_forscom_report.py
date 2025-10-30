from datetime import date

import pandas as pd
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

from auto_dsr.models import Unit
from reports.daily_status_report.constants import FOOTER_LOGO_SIZE, PAGE_WIDTH, QUARTER_INCH, inch


def draw_report(
    unit: Unit,
    canvas: Canvas,
    logos: dict[str, ImageReader],
    aircraft_data: pd.DataFrame,
    uas_data: pd.DataFrame,
    aircraft_fhp_data: pd.DataFrame,
    positions: tuple[str, str, str] = (None, None, None),
):
    """
    Draws the Unit Name and header information

    @param unit: (auto_dsr.models.Unit) the Unit to draw the header for
    @param canvas: (Canvas) the canvas to draw the header on
    @param page_number: (int) the page number being drawn
    @param positions (tuple[str, str]) a tuple containing string representations of the unit OIC and NCOIC
    """
    canvas.saveState()
    canvas.setFont("Roboto", 8)
    try:
        if unit.parent_uic and unit.parent_uic.logo and unit.logo:
            if unit.parent_uic.uic not in logos:
                logos[unit.parent_uic.uic] = ImageReader(unit.parent_uic.logo)
            left_logo = logos[unit.parent_uic.uic]
            if unit.uic not in logos:
                logos[unit.uic] = ImageReader(unit.logo)
            right_logo = logos[unit.uic]
        elif unit.logo:
            if unit.uic not in logos:
                logos[unit.uic] = ImageReader(unit.logo)
            left_logo = logos[unit.uic]
            right_logo = logos[unit.uic]
        else:
            left_logo = "static/auto_dsr/img/unit_logos/AFC.png"
            right_logo = "static/auto_dsr/img/unit_logos/ai2c.png"
    except:
        left_logo = "static/auto_dsr/img/unit_logos/AFC.png"
        right_logo = "static/auto_dsr/img/unit_logos/ai2c.png"
    landscape_letter = landscape(letter)
    canvas.drawImage(
        "static/auto_dsr/img/reports/forscom_report_template.png",
        0,
        0,
        width=landscape_letter[0],
        height=landscape_letter[1],
    )
    canvas.drawImage(
        left_logo,
        x=100,
        y=520,
        width=30,
        height=30,
        preserveAspectRatio=True,
        anchor="se",
        anchorAtXY=True,
    )
    canvas.drawImage(
        right_logo,
        x=710,
        y=520,
        width=30,
        height=30,
        preserveAspectRatio=True,
        anchor="se",
        anchorAtXY=True,
    )
    canvas.drawImage(
        right_logo,
        x=680,
        y=220,
        width=125,
        height=125,
        preserveAspectRatio=True,
        anchor="se",
        anchorAtXY=True,
    )
    # Rotary Wing Data
    data_list = aircraft_data.values.tolist()
    for i in range(0, 7):
        for j in range(0, 18):
            canvas.drawCentredString(105 + 35 * j, 415 + 10 * i, data_list[6 - i][j])
    # UAS Data
    data_list = uas_data.values.tolist()
    for i in range(0, 3):
        for j in range(0, 18):
            if len(uas_data) > 0:
                canvas.drawCentredString(105 + 35 * j, 360 + 10 * i, data_list[2 - i][j])
            else:
                canvas.drawCentredString(105 + 35 * j, 360 + 10 * i, "--")
    # RW FHP Data
    data_list = aircraft_fhp_data.values.tolist()
    for i in range(0, 7):
        for j in range(0, 6):
            if len(uas_data) > 0:
                canvas.drawCentredString(120 + 70 * j, 256 + 10 * i, data_list[6 - i][j])
            else:
                canvas.drawCentredString(120 + 70 * j, 256 + 10 * i, "--")
    # UAS FHP Data (NOT CURRENTLY IMPLEMENTED)
    for i in range(0, 3):
        for j in range(0, 6):
            canvas.drawCentredString(120 + 70 * j, 192 + 10 * i, "--")
    # Date
    canvas.drawString(x=55, y=171, text=f"Date: {date.today()}")
    # Positions
    if positions[0]:
        canvas.drawString(x=525, y=192, text=positions[0])
    if positions[1]:
        canvas.drawString(x=535, y=182, text=positions[1])
    if positions[2]:
        canvas.drawString(x=555, y=172, text=positions[2])
    # Unit Name
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawCentredString(x=400, y=530, text=f"{unit.short_name} Aviation Mission Availability Rates")

    canvas.restoreState()
