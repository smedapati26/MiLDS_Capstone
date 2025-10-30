import pandas as pd
from reportlab.platypus import Table, TableStyle

from reports.generator.constants import (
    DSR_SLANT_TABLE_FONT_SIZE,
    DSR_SLANT_TABLE_HEADER_FONT_SIZE,
    HALF_INCH,
    THREE_QUARTER_INCH,
)


def assemble_flight_hours_slant(dsr_slant_df: pd.DataFrame) -> Table:
    """
    Assembles a unit's DSR flight hours Slant table

    @param dsr_slant_df: (pd.DataFrame) the unit's DSR details (specifically for the slant)
    @returns (Table) a fully assembled Table object ready to draw
    """
    dsr_flight_hours_table_style = dsr_flight_hours_slant_style()
    dsr_flight_hours_lists = dsr_slant_df_to_flight_hours_list(dsr_slant_df)
    dsr_flight_hours_colWidths = [HALF_INCH, *[THREE_QUARTER_INCH + 5] * (len(dsr_flight_hours_lists) - 1)]
    dsr_flight_hours_table = Table(
        dsr_flight_hours_lists,
        colWidths=dsr_flight_hours_colWidths,
        style=dsr_flight_hours_table_style,
    )
    return dsr_flight_hours_table


def dsr_slant_df_to_flight_hours_list(dsr_slant_df: pd.DataFrame) -> list[list]:
    """
    Given the DSR Slant DataFrame, compute the lists necessary to build the slant table

    @param dsr_slant_df: (pd.DataFrame) the DSR Slant DataFrame
    @returns ([[]]) a two dimensional matrix of lists for the DSR Flight Hours Table
    """
    flight_hours_df = dsr_slant_df.groupby(by="model").agg({"flight_hours": "sum"}).round(1)
    header = ["MDS", *flight_hours_df.index]
    values = ["Flight\nHours", *flight_hours_df.flight_hours]
    return [header, values]


def dsr_flight_hours_slant_style() -> TableStyle:
    """
    Generate the styles for the Unit DSR Details flight_hours Slant

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
