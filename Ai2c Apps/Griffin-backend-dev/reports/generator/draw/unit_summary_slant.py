import pandas as pd
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table, TableStyle

from auto_dsr.models import Unit
from reports.generator.constants import (
    LANDSCAPE_FULL_FRAME_WIDTH,
    PAGE_HEIGHT,
    QUARTER_INCH,
    SUMMARY_TABLE_FONT_SIZE,
    THREE_QUARTER_INCH,
    inch,
)
from reports.generator.data import fetch_slant_data_for


def draw_unit_summary_slant(unit: Unit, canvas: Canvas, include_uav: bool = True):
    """
    Draws the unit summary page's Slant Table

    @param unit: (auto_dsr.models.Unit) the Unit to fetch unit summary data for
    @param canvas: (Canvas) the canvas to draw on
    @param include_uav: (bool) (defaults True) if Unmanned Aerial Vehicles should be
                        included in the export (if the unit has any)
    """
    canvas.saveState()
    # 1. Create frame
    slant_table_frame = Frame(
        x1=QUARTER_INCH,
        y1=0.6 * PAGE_HEIGHT,
        width=LANDSCAPE_FULL_FRAME_WIDTH,
        height=2.38 * inch,
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0,
    )
    # slant_table_frame.drawBoundary(canvas)
    # 2. Fetch slant data
    slant_df = fetch_slant_data_for(unit, include_uav)
    # 3. Create and Format Table
    slant_table = create_slant_table(slant_df)
    # 4. Draw Table
    ret = slant_table_frame.add(slant_table, canvas)
    canvas.restoreState()


def create_slant_table(slant_df: pd.DataFrame) -> Table:
    """
    Given a Unit Summary Slant DataFrame, creates the corresponding Slant Table

    @param slant_df: (pd.DataFrame) the slant DataFrame to make into a table
    @returns (Table) the reportlab table to paint on the page
    """
    slant_table_style = style_slant_table(slant_df)
    header_1 = [
        "Model",
        "On Hand",
        "Bank Time",
        "FMC",
        "",
        "PMC",
        *[""] * 3,
        "MTF",
        "",
        "NMC",
        "",
        "NMCS",
        "",
        "NMCM",
        *[""] * 5,
    ]
    header_2 = [*[""] * 5, "PMCM", "", "PMCS", *[""] * 7, "FIELD", "", "SUST", "", "DADE", ""]
    header_3 = [*[""] * 3, *["#", "%"] * 9]
    fields = [
        "on_hand",
        "bank_time",
        "FMC",
        "FMC_perc",
        "PMCM",
        "PMCM_perc",
        "PMCS",
        "PMCS_perc",
        "MTF",
        "MTF_perc",
        "NMC",
        "NMC_perc",
        "NMCS",
        "NMCS_perc",
        "FIELD",
        "FIELD_perc",
        "SUST",
        "SUST_perc",
        "DADE",
        "DADE_perc",
    ]
    col_widths = [THREE_QUARTER_INCH, THREE_QUARTER_INCH, THREE_QUARTER_INCH, *[QUARTER_INCH + 15] * 18]
    return Table(
        [header_1, header_2, header_3, *slant_df[fields].to_records().tolist()],
        colWidths=col_widths,
        style=slant_table_style,
    )


def style_slant_table(df: pd.DataFrame):
    """
    Gets the Unit Summary Slant Table Style

    @param df (pd.DataFrame) the slant DataFrame
    @returns (TableStyle) the TableStyle object containing the slant table styles
    """
    style = TableStyle([])
    # Entire Table
    style.add("FONTNAME", (0, 0), (-1, -1), "Roboto")
    style.add("FONTSIZE", (0, 0), (-1, -1), SUMMARY_TABLE_FONT_SIZE)
    style.add("LEADING", (0, 0), (-1, -1), SUMMARY_TABLE_FONT_SIZE + 2)
    style.add("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    style.add("ALIGNMENT", (0, 0), (-1, -1), "CENTRE")
    style.add("TEXTCOLOR", (0, 0), (-1, -1), "#1A1A1A")
    # Header
    style.add("FONTNAME", (0, 0), (-1, 2), "Roboto-Bold")
    style.add("BACKGROUND", (0, 0), (-1, 2), "#00458A")
    style.add("TEXTCOLOR", (0, 0), (-1, 2), "#FFFFFF")
    style.add("SPAN", (0, 0), (0, 2))  # Model
    style.add("SPAN", (1, 0), (1, 2))  # On Hand
    style.add("SPAN", (2, 0), (2, 2))  # Bank Time
    style.add("SPAN", (3, 0), (4, 1))  # FMC
    style.add("SPAN", (5, 0), (8, 0))  # PMC
    style.add("SPAN", (5, 1), (6, 1))  # PMCM
    style.add("SPAN", (7, 1), (8, 1))  # PMCS
    style.add("SPAN", (9, 0), (10, 1))  # NMC
    style.add("SPAN", (11, 0), (12, 1))  # MTF
    style.add("SPAN", (13, 0), (14, 1))  # NMCS
    style.add("SPAN", (15, 0), (-1, 0))  # NMCM
    style.add("SPAN", (15, 1), (16, 1))  # FIELD
    style.add("SPAN", (17, 1), (18, 1))  # SUST
    style.add("SPAN", (19, 1), (20, 1))  # DADE
    # Row Backgrounds
    for i in range(3, df.shape[0] + 3, 2):
        style.add("BACKGROUND", (0, i), (-1, i), "#F2F2F2")

    return style
