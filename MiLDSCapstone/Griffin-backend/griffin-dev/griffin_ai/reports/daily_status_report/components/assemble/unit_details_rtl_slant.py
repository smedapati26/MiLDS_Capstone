import pandas as pd
from reportlab.platypus import Table, TableStyle

from reports.generator.constants import (
    THREE_QUARTER_INCH,
    DSR_SLANT_TABLE_FONT_SIZE,
    DSR_SLANT_TABLE_HEADER_FONT_SIZE,
)


def assemble_rtl_slant(dsr_slant_df: pd.DataFrame) -> Table:
    """
    Assembles a unit's DSR RTL Slant table

    @param dsr_slant_df: (pd.DataFrame) the unit's DSR details (specifically for the slant)
    @returns (Table) a fully assembled Table object ready to draw
    """
    header_1 = ["RTL", "Total"]
    dsr_rtl_table_style = dsr_rtl_slant_style()
    dsr_rtl_col_widths = [THREE_QUARTER_INCH - 7, THREE_QUARTER_INCH - 7]
    dsr_rtl_table = Table(
        [header_1, [dsr_slant_df[dsr_slant_df.rtl == "RTL"].shape[0], dsr_slant_df.shape[0]]],
        colWidths=dsr_rtl_col_widths,
        style=dsr_rtl_table_style,
    )
    return dsr_rtl_table


def dsr_rtl_slant_style() -> TableStyle:
    """
    Generate the styles for the Unit DSR Details RTL Slant

    @returns (TableStyle) the TableStyle object to use for styling
    """
    style = TableStyle([])
    # Entire Table
    style.add("FONTNAME", (0, 0), (-1, -1), "Roboto-Bold")
    style.add("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    style.add("ALIGNMENT", (0, 0), (-1, -1), "CENTRE")
    style.add("TEXTCOLOR", (0, 0), (-1, -1), "#1A1A1A")
    # Header
    style.add("BACKGROUND", (0, 0), (-1, 0), "#00458A")
    style.add("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF")
    style.add("FONTSIZE", (0, 0), (-1, 0), DSR_SLANT_TABLE_HEADER_FONT_SIZE)
    style.add("LEADING", (0, 0), (-1, 0), DSR_SLANT_TABLE_HEADER_FONT_SIZE)
    # Values
    style.add("FONTSIZE", (0, 1), (-1, 1), DSR_SLANT_TABLE_FONT_SIZE)
    style.add("LEADING", (0, 1), (-1, 1), DSR_SLANT_TABLE_FONT_SIZE)
    return style
