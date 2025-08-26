import pandas as pd
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Table, TableStyle

from aircraft.utils import get_phase_interval
from reports.generator.constants import (
    HALF_INCH,
    THREE_QUARTER_INCH,
    QUARTER_INCH,
    inch,
    LANDSCAPE_FULL_FRAME_WIDTH,
    TABLE_FONT_SIZE,
    BASE_COLUMN_COUNT,
    PMC_STATUSES,
    NMC_STATUSES,
)
from reports.generator.utils import alert_formatting, sort_inspection_columns


def generate_dsr_tables(canvas: Canvas, dsr_dfs: list[pd.DataFrame], aircraft: bool = True):
    """
    Generates details tables by transforming dsr_dfs into subordinate unit lists

    @param unit: (auto_dsr.models.Unit) the Unit to draw the header for
    @param canvas: (Canvas) the canvas to draw the header on
    @param dsr_dfs: ([pd.DataFrame]) The data to put into the table
    @param aircraft: (bool) a boolean flag indicating if the generated tables are for manned aircraft or UAS
    """
    sub_unit_tables = []
    if aircraft:
        insp_col_counts = [
            len([colname for colname in dsr_df.columns if colname.endswith("_insp")]) for dsr_df in dsr_dfs
        ]
        mods_col_counts = [
            len([colname for colname in dsr_df.columns if colname.endswith("_mods")]) for dsr_df in dsr_dfs
        ]
        for dsr_df in dsr_dfs:
            sub_unit_tables.append(dsr_df_to_dsr_table(dsr_df, max(insp_col_counts), max(mods_col_counts)))
    else:
        for dsr_df in dsr_dfs:
            sub_unit_tables.append(uas_dsr_df_to_dsr_table(dsr_df))

    return sub_unit_tables


def uas_dsr_df_to_dsr_table(df: pd.DataFrame):
    """
    Given a pandas dataframe creates a fully formatted ReportLab Table

    @param df: (pd.DataFrame) the dataframe to make into a table
    @returns (reportlab.platypus.Table) the Table object to paint on the canvas (already fully formatted)
    """
    table_style = uas_dsr_table_style(df)

    table_data = uas_dsr_df_to_table_list(df)

    col_widths = uas_dsr_col_widths()

    return Table(data=table_data, style=table_style, colWidths=col_widths)


def uas_dsr_df_to_table_list(df: pd.DataFrame):
    """
    Given a pandas DataFrame, create the lists necessary for table creation

    @param df: (pd.DataFrame) the pandas dataframe to turn into a 2 dimensional list of lists
    @returns ([[]]) a list of lists representing the contents of the UAS DSR Table
    """
    df.model = df.apply(lambda row: row.model.split("(")[0], axis=1)
    dsr_columns = [
        "model",
        "serial_number",
        "location__name",
        "rtl",
        "status",
        "date_down",
        "days_down",
        "ecd",
        "total_airframe_hours",
        "remarks",
        "flight_hours",
    ]
    uas_data = df[dsr_columns].to_numpy().tolist()

    column_names = [
        "Model",
        "Serial\nNumber",
        "Location",
        "RTL",
        "Status",
        "Date\nDown",
        "Days\nDown",
        "ECD",
        "Total\nHours",
        "Remarks",
        "Flight\nHours",
    ]

    return [column_names, *uas_data]


def uas_dsr_col_widths() -> list[int]:
    """
    Defines the column widths for the UAS DSR Table

    @returns ([int]) a list of column widths for the UAS DSR table
    """
    column_width_max_min = {
        "model": {"min": QUARTER_INCH + 10, "max": QUARTER_INCH + 20},
        "serial_number": {"min": HALF_INCH - 5, "max": HALF_INCH},
        "location": {"min": HALF_INCH, "max": THREE_QUARTER_INCH},
        "rtl": {"min": HALF_INCH - 15, "max": HALF_INCH - 5},
        "status": {"min": HALF_INCH - 15, "max": HALF_INCH - 5},
        "date_down": {"min": HALF_INCH - 10, "max": HALF_INCH},
        "days_down": {"min": QUARTER_INCH, "max": QUARTER_INCH + 5},
        "ecd": {"min": HALF_INCH - 10, "max": HALF_INCH},
        "total_airframe_hours": {"min": QUARTER_INCH + 5, "max": QUARTER_INCH + 10},
        "remarks": {"min": 3.5 * inch, "max": 5 * inch},
        "flight_hours": {"min": QUARTER_INCH, "max": QUARTER_INCH + 5},
    }
    column_widths = {
        column: max_min["min"]
        for column, max_min in column_width_max_min.items()
        if column not in ["inspections", "mods"]
    }
    if sum(column_widths.values()) < LANDSCAPE_FULL_FRAME_WIDTH:
        difference = LANDSCAPE_FULL_FRAME_WIDTH - sum(column_widths.values())
        column_widths["remarks"] = min(column_widths["remarks"] + difference, column_width_max_min["remarks"]["max"])

    col_widths = [
        column_widths["model"],
        column_widths["serial_number"],
        column_widths["location"],
        column_widths["rtl"],
        column_widths["status"],
        column_widths["date_down"],
        column_widths["days_down"],
        column_widths["ecd"],
        column_widths["total_airframe_hours"],
        column_widths["remarks"],
        column_widths["flight_hours"],
    ]
    return col_widths


def uas_dsr_table_style(df: pd.DataFrame) -> TableStyle:
    """
    Gets the UAS Details Table Style definition for a given dataframe

    @param unit_length: (int) a list of the length of each company in the unit to display
    @param inspections_column_count: (int) the number of inspections columns. Used to determine how many
                                     columns, if any, should be added to pad the inspections columns
    @param mods_column_count: (int) the number of modifications columns. Used to determine how many columns,
                              if any, should be added to pad the modifications columns
    @returns (reportlab.platypus.TableStyle) A TableStyle object for the given table
    """
    style = TableStyle([])
    # Entire Table
    style.add("FONTNAME", (0, 0), (-1, -1), "Roboto")
    style.add("FONTSIZE", (0, 0), (-1, -1), TABLE_FONT_SIZE)
    style.add("LEADING", (0, 0), (-1, -1), TABLE_FONT_SIZE)
    style.add("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    style.add("ALIGNMENT", (0, 0), (-1, -1), "CENTRE")
    style.add("TEXTCOLOR", (0, 0), (-1, -1), "#1A1A1A")
    # Header
    style.add("FONTNAME", (0, 0), (-1, 0), "Roboto-Bold")
    style.add("BACKGROUND", (0, 0), (-1, 0), "#00458A")
    style.add("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF")
    # Model Column
    current_model = None
    group_start = 1
    for i, model in df.model.items():
        if model != current_model:
            if current_model:
                style.add("SPAN", (0, group_start), (0, i))
                style.add("LINEBELOW", (0, i), (-1, i), 1, "#1A1A1A")
            current_model = model
            group_start = i + 1
    style.add("SPAN", (0, group_start), (0, i + 1))
    style.add("FONTNAME", (0, 0), (0, -1), "Roboto-Bold")
    # Row Backgrounds
    for i in range(1, df.shape[0] + 1, 2):
        style.add("BACKGROUND", (1, i), (-1, i), "#F2F2F2")

    conditional_formatting_styles = []
    # Conditionally Format Status
    conditional_formatting_styles.extend(style_column(df["status"], 4, "status"))

    for s in conditional_formatting_styles:
        style.add(*s)
    return style


def dsr_df_to_dsr_table(df: pd.DataFrame, inspections_column_count: int, mods_column_count: int) -> Table:
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
    table_style = dsr_details_table_style(df, inspections_column_count, mods_column_count)

    col_widths = dsr_table_col_widths(inspections_column_count, mods_column_count)

    table_data = dsr_df_to_table_list(df, inspections_column_count, mods_column_count)

    return Table(data=table_data, style=table_style, colWidths=col_widths)


def dsr_table_col_widths(inspections_column_count: int, mods_column_count: int) -> list[int]:
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
        "mods": {"min": QUARTER_INCH + 5, "max": QUARTER_INCH + 10},
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
        column_widths["remarks"] = min(column_widths["remarks"] + difference, column_width_max_min["remarks"]["max"])

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
    df.model = df.apply(lambda row: "\n".join([*row.model[:5]]), axis=1)
    # Apply inspections column padding
    insp_padding = [str(i) for i in range(inspections_column_count - len(insp_dsr_columns))]
    if len(insp_padding) > 0:
        df[insp_padding] = ""
        insp_dsr_columns.extend(insp_padding)
    mods_dsr_columns = [colname for colname in df.columns if colname.endswith("_mods")]
    # Apply mods column padding
    mods_padding = [str(i) for i in range(mods_column_count - len(mods_dsr_columns))]
    if len(mods_padding) > 0:
        df[mods_padding] = ""
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


def dsr_details_table_style(df: pd.DataFrame, inspections_column_count: int, mods_column_count: int) -> TableStyle:
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
    style = TableStyle([])
    # Entire Table
    style.add("FONTNAME", (0, 0), (-1, -1), "Roboto")
    style.add("FONTSIZE", (0, 0), (-1, -1), TABLE_FONT_SIZE)
    style.add("LEADING", (0, 0), (-1, -1), TABLE_FONT_SIZE)
    style.add("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    style.add("ALIGNMENT", (0, 0), (-1, -1), "CENTRE")
    style.add("TEXTCOLOR", (0, 0), (-1, -1), "#1A1A1A")
    # Header
    style.add("FONTNAME", (0, 0), (-1, 0), "Roboto-Bold")
    style.add("BACKGROUND", (0, 0), (-1, 0), "#00458A")
    style.add("TEXTCOLOR", (0, 0), (-1, 0), "#FFFFFF")
    # Model Column
    current_model = None
    group_start = 1
    for i, model in df.model.items():
        if model != current_model:
            if current_model:
                style.add("SPAN", (0, group_start), (0, i))
                style.add("LINEBELOW", (0, i), (-1, i), 1, "#1A1A1A")
            current_model = model
            group_start = i + 1
    style.add("SPAN", (0, group_start), (0, i + 1))
    style.add("FONTNAME", (0, 0), (0, -1), "Roboto-Bold")
    # Row Backgrounds
    for i in range(1, df.shape[0] + 1, 2):
        style.add("BACKGROUND", (1, i), (-1, i), "#F2F2F2")

    df = df.sort_values(by=["serial"])
    conditional_formatting_styles = []
    # Conditionally Format Status
    conditional_formatting_styles.extend(style_column(df["status"], 4, "status"))
    # Conditionally Format PMI
    conditional_formatting_styles.extend(style_column(df["hours_to_phase"], 9, "phase", df["model"]))
    # Conditionally Format Inspection Columns
    columns_before_inspections = BASE_COLUMN_COUNT - 2
    for i, insp_column in enumerate(insp_dsr_columns):
        conditional_formatting_styles.extend(
            style_column(df[insp_column], columns_before_inspections + i, "inspection")
        )
    # Conditionally Format Modifications Columns
    columns_before_mods = BASE_COLUMN_COUNT + inspections_column_count
    for i, mod_column in enumerate(mods_dsr_columns):
        conditional_formatting_styles.extend(style_column(df[mod_column], columns_before_mods + i, "status"))
    for s in conditional_formatting_styles:
        style.add(*s)
    return style


def style_column(
    column: pd.Series, table_col_index: int, rule_set: str, model: pd.Series = None
) -> list[(str, tuple[int, int], tuple[int, int], str)]:
    """
    Given a pandas Series representing a table column, style accordingly

    @param column: (pd.Series) the pandas Series containing the values for the column to style based on
    @param table_col_index: (int) the column index value (for use when computing the coordinates)
    @param rule_set: (str) the set of different rules that can be applied to conditional formatting
    @param model: (pd.Series) (default None) the aircraft model to use if computing phase styling
    """
    styles = []
    if rule_set == "status":
        for i, value in column.items():
            if value == "FMC":
                styles.extend(alert_formatting((table_col_index, i + 1), "confirmation"))
            elif value in PMC_STATUSES:
                styles.extend(alert_formatting((table_col_index, i + 1), "caution"))
            elif value in NMC_STATUSES:
                styles.extend(alert_formatting((table_col_index, i + 1), "error"))
            elif value == "MTF":
                styles.extend(alert_formatting((table_col_index, i + 1), "info"))

    elif rule_set == "inspection":
        inspection_interval = int(column.name.split(" ")[0])
        threshold = inspection_interval * 0.1
        for i, value in column.items():
            if type(value) != str and float(value) <= threshold:
                styles.extend(alert_formatting((table_col_index, i + 1), "error"))

    elif rule_set == "phase":
        inspection_interval = get_phase_interval(model[0])
        threshold = inspection_interval * 0.1
        for i, value in column.items():
            if float(value) <= threshold:
                styles.extend(alert_formatting((table_col_index, i + 1), "error"))

    return styles
