import pandas as pd
from reportlab.platypus import Table, TableStyle

from reports.daily_status_report.constants import QUARTER_INCH, RTL_TABLE_FONT_SIZE, THREE_QUARTER_INCH


def assemble_rtl_summary_table(rtl_df: pd.DataFrame) -> list:
    """
    Assembles one or two formatted RTL summary tables given an appropriately made DataFrame.

    @param rtl_df (pandas.DataFrame) the RTL Summary DataFrame
    @returns (list) A list of one or two Table objects fully styled and ready to be drawn
    """
    location_names = rtl_df.index.get_level_values(0)
    unique_locations = list(set(location_names))
    num_locations = len(unique_locations)

    if num_locations >= 8:
        # Split into two roughly equal parts
        mid_index = num_locations // 2
        first_half = rtl_df.loc[unique_locations[:mid_index]]
        second_half = rtl_df.loc[unique_locations[mid_index:]]

        return [
            create_rtl_summary_table(first_half),
            create_rtl_summary_table(second_half),
        ]
    else:
        return [create_rtl_summary_table(rtl_df)]


def create_rtl_summary_table(rtl_df: pd.DataFrame) -> Table:
    """Creates a single RTL summary table from a DataFrame."""
    longest_location = max(len(str(value)) for value in rtl_df.index.get_level_values(0))
    location_column_width = max(longest_location * 4, 54.0)
    rtl_summary_table_style = style_rtl_summary_table(rtl_df)

    header_1 = ["Location", "Model", "On Hand", "RTL", "", "NRTL", ""]
    header_2 = ["", "", "", "#", "%", "#", "%"]
    fields = ["on_hand", "RTL", "RTL_perc", "NRTL", "NRTL_perc"]
    col_widths = [location_column_width, THREE_QUARTER_INCH - 10, THREE_QUARTER_INCH - 10, *[QUARTER_INCH + 12] * 4]

    return Table(
        [header_1, header_2, *rtl_df[fields].to_records().tolist()],
        colWidths=col_widths,
        style=rtl_summary_table_style,
    )


def style_rtl_summary_table(rtl_df: pd.DataFrame) -> TableStyle:
    """
    Generates the appropriate styling for the RTL summary table

    @param rtl_df: (pd.DataFrame) the Pandas DataFrame containing RTL Summary data
    @returns (TableStyle) reportLab Table Style definitions
    """
    style = TableStyle([])
    # Entire Table
    style.add("FONTNAME", (0, 0), (-1, -1), "Roboto")
    style.add("FONTSIZE", (0, 0), (-1, -1), RTL_TABLE_FONT_SIZE + 2)
    style.add("LEADING", (0, 0), (-1, -1), RTL_TABLE_FONT_SIZE + 2)
    style.add("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    style.add("ALIGNMENT", (0, 0), (-1, -1), "CENTRE")
    style.add("TEXTCOLOR", (0, 0), (-1, -1), "#1A1A1A")
    # Header
    style.add("FONTNAME", (0, 0), (-1, 1), "Roboto-Bold")
    style.add("BACKGROUND", (0, 0), (-1, 1), "#00458A")
    style.add("TEXTCOLOR", (0, 0), (-1, 1), "#FFFFFF")
    style.add("SPAN", (0, 0), (0, 1))  # Location
    style.add("SPAN", (1, 0), (1, 1))  # Model
    style.add("SPAN", (2, 0), (2, 1))  # On Hand
    style.add("SPAN", (3, 0), (4, 0))  # RTL
    style.add("SPAN", (5, 0), (6, 0))  # NRTL
    # Group rows for Location
    location_group = None
    group_start = 1
    for i, location in enumerate(rtl_df.index.get_level_values(0)):
        if location != location_group:
            if location_group:
                style.add("SPAN", (0, group_start), (0, i + 1))
                style.add("LINEBELOW", (0, i + 1), (-1, i + 1), 1, "#1A1A1A")
            location_group = location
            group_start = i + 2
    # Last Location Group
    style.add("SPAN", (0, group_start), (0, -1))
    # Row Backgrounds
    for i in range(3, rtl_df.shape[0] + 3, 2):
        style.add("BACKGROUND", (1, i), (-1, i), "#F2F2F2")
    return style
