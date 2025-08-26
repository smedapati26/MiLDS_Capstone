import pandas as pd
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table, TableStyle

from reports.generator.constants import (
    QUARTER_INCH,
    THREE_QUARTER_INCH,
    HALF_INCH,
    LANDSCAPE_FULL_FRAME_WIDTH,
    DSR_SLANT_FRAME_START,
    DSR_SLANT_TABLE_HEADER_FONT_SIZE,
    DSR_SLANT_TABLE_FONT_SIZE,
)


def draw_system_status_slant(canvas: Canvas, dsr_slant_df: pd.DataFrame):
    """
    Draws a unit's DSR bank time Slant table

    @param canvas: (Canvas) The canvas to draw on
    @param dsr_slant_df: (pd.DataFrame) the unit's DSR details (specifically for the slant)
    """
    dsr_system_status_frame = Frame(
        x1=QUARTER_INCH + (LANDSCAPE_FULL_FRAME_WIDTH / 8),
        y1=DSR_SLANT_FRAME_START,
        width=LANDSCAPE_FULL_FRAME_WIDTH * 3 / 8,
        height=HALF_INCH - 2,
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0,
    )
    dsr_system_status_table_style = dsr_system_status_slant_style()
    dsr_system_status_lists = dsr_slant_df_to_system_status_list(dsr_slant_df)
    dsr_system_status_col_widths = [HALF_INCH, *[THREE_QUARTER_INCH] * (len(dsr_system_status_lists) - 1)]
    dsr_system_status_table = Table(
        dsr_system_status_lists,
        colWidths=dsr_system_status_col_widths,
        style=dsr_system_status_table_style,
    )
    dsr_system_status_frame.add(dsr_system_status_table, canvas)


def dsr_slant_df_to_system_status_list(dsr_slant_df: pd.DataFrame) -> list[list]:
    """
    Given the DSR Slant DataFrame, compute the lists necessary to build the slant table

    @param dsr_slant_df: (pd.DataFrame) the DSR Slant DataFrame
    @returns ([[]]) a two dimensional matrix of lists for the DSR Bank Time Table
    """
    system_status_df = (
        dsr_slant_df.groupby(by="model").agg({"serial_number": "count"}).rename({"serial_number": "on_hand"}, axis=1)
    )

    system_status_df["system_status"] = "FMC"
    header = ["MDS", *system_status_df.index]
    values = ["System\nStatus", *system_status_df.system_status]
    return [header, values]


def dsr_system_status_slant_style() -> TableStyle:
    """
    Generate the styles for the Unit DSR Details UAS System Status Slant

    @returns (TableStyle) the TableStyle object to use for styling
    """
    style = TableStyle([])
    # Entire Table
    style.add("FONTNAME", (0, 0), (-1, -1), "Roboto-Bold")
    style.add("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    style.add("ALIGNMENT", (0, 0), (-1, -1), "CENTRE")
    style.add("TEXTCOLOR", (0, 0), (-1, -1), "#1A1A1A")
    # Header
    style.add("FONTSIZE", (0, 0), (-1, 0), DSR_SLANT_TABLE_HEADER_FONT_SIZE)
    style.add("LEADING", (0, 0), (-1, 0), DSR_SLANT_TABLE_HEADER_FONT_SIZE)
    # Leading Column
    style.add("BACKGROUND", (0, 0), (0, 1), "#00458A")
    style.add("TEXTCOLOR", (0, 0), (0, 1), "#FFFFFF")
    style.add("FONTSIZE", (0, 0), (0, 1), DSR_SLANT_TABLE_HEADER_FONT_SIZE)
    style.add("LEADING", (0, 0), (0, 1), DSR_SLANT_TABLE_HEADER_FONT_SIZE)
    # Values
    style.add("FONTSIZE", (1, 1), (-1, 1), DSR_SLANT_TABLE_FONT_SIZE)
    style.add("LEADING", (1, 1), (-1, 1), DSR_SLANT_TABLE_FONT_SIZE)
    return style
