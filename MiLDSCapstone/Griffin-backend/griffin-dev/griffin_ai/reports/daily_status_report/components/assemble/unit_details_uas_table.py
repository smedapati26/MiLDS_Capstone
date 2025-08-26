import pandas as pd
from reportlab.platypus import Table, TableStyle

from reports.generator.constants import (
    HALF_INCH,
    THREE_QUARTER_INCH,
    QUARTER_INCH,
    inch,
    LANDSCAPE_FULL_FRAME_WIDTH,
    TABLE_FONT_SIZE,
)
from reports.daily_status_report.utils import style_dsr_column


def assemmble_uas_details_table(df: pd.DataFrame):
    """
    Given a pandas dataframe creates a fully formatted ReportLab Table

    @param df: (pd.DataFrame) the dataframe to make into a table
    @returns (reportlab.platypus.Table) the Table object to paint on the canvas (already fully formatted)
    """
    table_style = uas_dsr_table_style(df)

    table_data = uas_dsr_df_to_table_list(df)

    col_widths = uas_dsr_col_widths()

    return Table(data=table_data, style=table_style, colWidths=col_widths)


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
        "remarks": {"min": 2 * inch, "max": 5 * inch},
        "flight_hours": {"min": QUARTER_INCH, "max": QUARTER_INCH + 5},
    }
    column_widths = {
        column: max_min["min"]
        for column, max_min in column_width_max_min.items()
        if column not in ["inspections", "mods"]
    }
    if sum(column_widths.values()) < LANDSCAPE_FULL_FRAME_WIDTH:
        difference = LANDSCAPE_FULL_FRAME_WIDTH - sum(column_widths.values())
        column_widths["remarks"] = column_widths["remarks"] + difference

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


def uas_dsr_df_to_table_list(df: pd.DataFrame):
    """
    Given a pandas DataFrame, create the lists necessary for table creation

    @param df: (pd.DataFrame) the pandas dataframe to turn into a 2 dimensional list of lists
    @returns ([[]]) a list of lists representing the contents of the UAS DSR Table
    """
    df.loc[:, "model"] = df.apply(lambda row: row.model.split("(")[0], axis=1)
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


def uas_dsr_table_style(df: pd.DataFrame) -> TableStyle:
    """
    Gets the UAS Details Table Style definition for a given dataframe

    @param df: (pandas.DataFrame) the DataFrame to generate styles for
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
    for i, model in enumerate(df.model.to_list()):
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
    conditional_formatting_styles.extend(style_dsr_column(df["status"], 4, "status"))

    for s in conditional_formatting_styles:
        style.add(*s)
    return style
