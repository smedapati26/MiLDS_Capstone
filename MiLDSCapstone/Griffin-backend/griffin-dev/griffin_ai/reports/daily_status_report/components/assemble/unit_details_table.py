import pandas as pd
from reportlab.platypus import Table, TableStyle

from reports.generator.constants import (
    HALF_INCH,
    THREE_QUARTER_INCH,
    QUARTER_INCH,
    inch,
    LANDSCAPE_FULL_FRAME_WIDTH,
    TABLE_FONT_SIZE,
    BASE_COLUMN_COUNT,
)
from reports.daily_status_report.utils import style_dsr_column, sort_inspection_columns


def assemble_aircraft_details_table(df: pd.DataFrame, inspections_column_count: int, mods_column_count: int) -> Table:
    """
    Given a pandas dataframe and the length of the inspections and modifications columns to pad to
    creates a fully formatted ReportLab Table

    @param df: (pd.DataFrame) the dataframe to make into a table
    @param inspections_column_count: (int) the number of inspections columns. Used to determine how many
                                     columns, if any, should be added to pad the inspections columns
    @param mods_column_count: (int) the number of modifications columns. Used to determine how many columns,
                              if any, should be added to pad the modifications columns
    @returns (reportlab.platypus.Table) the Table object to paint on the canvas (already fully formatted)
    """
    table_style, longest_mod = dsr_details_table_style(df, inspections_column_count, mods_column_count)

    col_widths = dsr_table_col_widths(inspections_column_count, mods_column_count, longest_mod)

    table_data = dsr_df_to_table_list(df, inspections_column_count, mods_column_count)
    # return Table(data=table_data, colWidths=col_widths)
    return Table(data=table_data, style=table_style, colWidths=col_widths)


def dsr_table_col_widths(
    inspections_column_count: int,
    mods_column_count: int,
    longest_mod: int,
) -> list[int]:
    """
    Given the number of inspections and Modifications Columns, compute column widths to fill the frame widths

    @param inspections_column_count: (int) the number of inspections columns
    @param mods_column_count: (int) the number of modifications columns
    @return ([int]) a list of column widths for the DSR Details table
    """
    column_width_max_min = {
        "model": {"min": QUARTER_INCH - 5, "max": QUARTER_INCH},
        "serial": {"min": HALF_INCH - 5, "max": HALF_INCH},
        "location": {"min": HALF_INCH, "max": THREE_QUARTER_INCH},
        "rtl": {"min": HALF_INCH - 15, "max": HALF_INCH - 5},
        "status": {"min": HALF_INCH - 15, "max": HALF_INCH - 5},
        "date_down": {"min": HALF_INCH - 10, "max": HALF_INCH},
        "days_down": {"min": QUARTER_INCH, "max": QUARTER_INCH + 5},
        "ecd": {"min": HALF_INCH - 10, "max": HALF_INCH},
        "total_airframe_hours": {"min": QUARTER_INCH + 5, "max": QUARTER_INCH + 10},
        "pmi": {"min": QUARTER_INCH, "max": QUARTER_INCH + 5},
        "remarks": {"min": 3.5 * inch, "max": 4.5 * inch},
        "flight_hours": {"min": QUARTER_INCH, "max": QUARTER_INCH + 5},
        "inspections": {"min": QUARTER_INCH + 5, "max": QUARTER_INCH + 5},
        "mods": {"min": (longest_mod / 4) * QUARTER_INCH, "max": HALF_INCH + 10},
    }
    column_widths = {
        column: max_min["min"]
        for column, max_min in column_width_max_min.items()
        if column not in ["inspections", "mods"]
    }
    for i in range(inspections_column_count):
        column_widths[f"insp_{i}"] = column_width_max_min["inspections"]["min"]
    for i in range(mods_column_count):
        column_widths[f"mods_{i}"] = column_width_max_min["mods"]["min"]
    if sum(column_widths.values()) < LANDSCAPE_FULL_FRAME_WIDTH:
        difference = LANDSCAPE_FULL_FRAME_WIDTH - sum(column_widths.values())
        column_widths["remarks"] = column_widths["remarks"] + difference

    col_widths = [
        column_widths["model"],
        column_widths["serial"],
        column_widths["location"],
        column_widths["rtl"],
        column_widths["status"],
        column_widths["date_down"],
        column_widths["days_down"],
        column_widths["ecd"],
        column_widths["total_airframe_hours"],
        column_widths["pmi"],
        *[column_widths[f"insp_{i}"] for i in range(inspections_column_count)],
        column_widths["remarks"],
        column_widths["flight_hours"],
        *[column_widths[f"mods_{i}"] for i in range(mods_column_count)],
    ]
    return col_widths


def dsr_df_to_table_list(df: pd.DataFrame, inspections_column_count: int, mods_column_count: int) -> list[list]:
    """
    Given a pandas DataFrame, create the lists necessary for table creation

    @param df: (pd.DataFrame) the pandas dataframe to turn into a 2 dimensional list of lists
    @param inspections_column_count: (int) the number of inspections columns. Used to determine how many
                                     columns, if any, should be added to pad the inspections columns
    @param mods_column_count: (int) the number of modifications columns. Used to determine how many columns,
                              if any, should be added to pad the modifications columns
    @returns ([[]]) a list of lists representing the contents of the DSR Table
    """
    insp_dsr_columns = [colname for colname in df.columns if colname.endswith("_insp")]
    insp_dsr_columns = sort_inspection_columns(insp_dsr_columns, descending=True)
    # Adjust Model to display vertically
    df.loc[:, "model"] = df.apply(lambda row: "\n".join([*row.model[:5]]), axis=1)
    # Apply inspections column padding
    insp_padding = [str(i) for i in range(inspections_column_count - len(insp_dsr_columns))]
    if len(insp_padding) > 0:
        df.loc[:, insp_padding] = ""
        insp_dsr_columns.extend(insp_padding)
    mods_dsr_columns = [colname for colname in df.columns if colname.endswith("_mods")]
    # Apply mods column padding
    mods_padding = [str(i) for i in range(mods_column_count - len(mods_dsr_columns))]
    if len(mods_padding) > 0:
        df.loc[:, mods_padding] = ""
        mods_dsr_columns.extend(mods_padding)
    dsr_columns = [
        "model",
        "serial",
        "location__name",
        "rtl",
        "status",
        "date_down",
        "days_down",
        "ecd",
        "total_airframe_hours",
        "hours_to_phase",
        *insp_dsr_columns,
        "remarks",
        "flight_hours",
        *mods_dsr_columns,
    ]
    aircraft_data = df[dsr_columns].to_numpy().tolist()

    column_names = [
        "MDS",
        "Tail #",
        "Location",
        "RTL",
        "Status",
        "Date\nDown",
        "Days\nDown",
        "ECD",
        "Total\nHours",
        "PMI",
        *[colname[:-9] + "Hr" if len(colname) > 1 else "" for colname in insp_dsr_columns],
        "Remarks",
        "Flight\nHours",
        *[colname[:-5] if len(colname) > 1 else "" for colname in mods_dsr_columns],
    ]
    return [column_names, *aircraft_data]


def dsr_details_table_style(
    df: pd.DataFrame, inspections_column_count: int, mods_column_count: int
) -> tuple[TableStyle, int]:
    """
    Gets the Aircraft Details Table Style definition for a given unit

    @param unit_length: (int) a list of the length of each company in the unit to display
    @param inspections_column_count: (int) the number of inspections columns. Used to determine how many
                                     columns, if any, should be added to pad the inspections columns
    @param mods_column_count: (int) the number of modifications columns. Used to determine how many columns,
                              if any, should be added to pad the modifications columns
    @returns (reportlab.platypus.TableStyle) A TableStyle object for the given table
    """
    insp_dsr_columns = [colname for colname in df.columns if colname.endswith("_insp")]
    mods_dsr_columns = [colname for colname in df.columns if colname.endswith("_mods")]
    if len(mods_dsr_columns) > 0:
        longest_mod = len(max(mods_dsr_columns, key=len)) - 5
    else:
        longest_mod = 0

    longest_loc = df.location__name.map(len).max()
    longest_loc = longest_loc if longest_loc > 0 else 1
    location_font_size = min(55 / longest_loc, TABLE_FONT_SIZE)

    style = TableStyle([])

    # Entire Table
    style.add("FONTNAME", (1, 0), (-1, -1), "Roboto")
    style.add("FONTSIZE", (0, 0), (-1, -1), TABLE_FONT_SIZE)
    style.add("LEADING", (0, 0), (-1, -1), TABLE_FONT_SIZE)
    style.add("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    style.add("ALIGNMENT", (0, 0), (-1, -1), "CENTRE")
    style.add("TEXTCOLOR", (0, 0), (-1, -1), "#1A1A1A")
    # Header
    style.add("FONTNAME", (0, 0), (-1, 0), "Roboto-Bold")
    style.add("BACKGROUND", (0, 0), (-1, 0), "#00458A")
    style.add("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF")
    # Resize Location Column Font to Fit
    style.add("FONTSIZE", (2, 1), (2, -1), location_font_size)
    # Model Column
    current_model = None
    group_start = 1
    style.add("SPAN", (0, 1), (0, -1))
    for i, model in enumerate(df.model.to_list()):
        if model != current_model:
            if current_model:
                style.add("SPAN", (0, group_start), (0, i))
                style.add("LINEBELOW", (0, i), (-1, i), 1, "#1A1A1A")
            current_model = model
            group_start = i + 1
    style.add("SPAN", (0, group_start), (0, i))
    style.add("FONTNAME", (0, 1), (0, -1), "Roboto-Bold")
    # Row Backgrounds
    for i in range(1, df.shape[0], 2):
        style.add("BACKGROUND", (1, i), (-1, i), "#F2F2F2")

    df = df.sort_values(by=["serial"])
    conditional_formatting_styles = []
    # Conditionally Format Status
    conditional_formatting_styles.extend(style_dsr_column(df["status"], 4, "status"))
    # Conditionally Format PMI
    conditional_formatting_styles.extend(style_dsr_column(df["hours_to_phase"], 9, "phase", df["model"]))
    # Conditionally Format Inspection Columns
    columns_before_inspections = BASE_COLUMN_COUNT - 2
    for i, insp_column in enumerate(insp_dsr_columns):
        conditional_formatting_styles.extend(
            style_dsr_column(df[insp_column], columns_before_inspections + i, "inspection")
        )
    # Conditionally Format Modifications Columns
    columns_before_mods = BASE_COLUMN_COUNT + inspections_column_count
    for i, mod_column in enumerate(mods_dsr_columns):
        conditional_formatting_styles.extend(style_dsr_column(df[mod_column], columns_before_mods + i, "status"))
    for s in conditional_formatting_styles:
        style.add(*s)
    return style, max(0, longest_mod)
