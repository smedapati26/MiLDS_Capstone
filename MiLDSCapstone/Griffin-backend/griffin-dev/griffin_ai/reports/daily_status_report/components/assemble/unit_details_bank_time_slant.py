import pandas as pd
from reportlab.platypus import Table, TableStyle

from aircraft.utils import get_phase_interval
from reports.generator.constants import (
    THREE_QUARTER_INCH,
    HALF_INCH,
    DSR_SLANT_TABLE_HEADER_FONT_SIZE,
    DSR_SLANT_TABLE_FONT_SIZE,
)


def assemble_bank_time_slant(dsr_slant_df: pd.DataFrame) -> Table:
    """
    Assembles a unit's DSR bank time slant table

    @param dsr_slant_df: (pd.DataFrame) the unit's DSR details (specifically for the slant)
    @returns (Table) a fully assembled Table object ready to draw
    """
    dsr_bank_time_table_style = dsr_bank_time_slant_style()
    dsr_bank_time_lists = dsr_slant_df_to_bank_table_list(dsr_slant_df)
    dsr_bank_time_colWidths = [HALF_INCH, *[THREE_QUARTER_INCH] * (len(dsr_bank_time_lists) - 1)]
    dsr_bank_time_table = Table(
        dsr_bank_time_lists,
        colWidths=dsr_bank_time_colWidths,
        style=dsr_bank_time_table_style,
    )
    return dsr_bank_time_table


def dsr_slant_df_to_bank_table_list(dsr_slant_df: pd.DataFrame) -> list[list]:
    """
    Given the DSR Slant DataFrame, compute the lists necessary to build the slant table

    @param dsr_slant_df: (pd.DataFrame) the DSR Slant DataFrame
    @returns ([[]]) a two dimensional matrix of lists for the DSR Bank Time Table
    """
    bank_time_df = (
        dsr_slant_df.groupby(by="model")
        .agg({"hours_to_phase": "sum", "serial": "count"})
        .rename({"serial": "on_hand"}, axis=1)
    )
    bank_time_df["max_bw_phases"] = bank_time_df.apply(lambda row: row.on_hand * get_phase_interval(row.name), axis=1)
    bank_time_df["bank_time"] = (bank_time_df.hours_to_phase / bank_time_df.max_bw_phases).map("{:.1%}".format)
    bank_time_df.bank_time = bank_time_df.apply(lambda row: "NA" if "Q-" in row.name else row.bank_time, axis=1)
    header = ["MDS", *bank_time_df.index]
    values = ["Bank\nTime", *bank_time_df.bank_time]
    return [header, values]


def dsr_bank_time_slant_style() -> TableStyle:
    """
    Generate the styles for the Unit DSR Details bank_time Slant

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
