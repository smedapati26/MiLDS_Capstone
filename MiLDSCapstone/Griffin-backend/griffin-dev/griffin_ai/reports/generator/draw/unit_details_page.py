from datetime import date
import pandas as pd
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Paragraph, Table
from reportlab.lib.utils import ImageReader

from auto_dsr.models import Unit
from reports.generator.constants import (
    HALF_INCH,
    REMARKS_STYLE,
    QUARTER_INCH,
    LANDSCAPE_FULL_FRAME_WIDTH,
    DSR_DETAILS_FRAME_HEIGHT,
)
from reports.generator.data import fetch_dsr_data_for
from reports.generator.draw import draw_header, draw_footer
from reports.generator.draw.unit_details_dsr_table import generate_dsr_tables
from reports.generator.draw.unit_details_slant_section import generate_dsr_slants


def generate_unit_details(
    unit: Unit, canvas: Canvas, page_number: int, logos: dict[str, ImageReader], include_uas: bool
) -> int:
    """
    Generates the Unit Details Page. The Unit Details page includes:
    1. The unit's Aircraft details in a table
    2. A slant section containing:
        a. the number of RTL aircraft of the total number
        b. the bank time by MDS for the unit
        c. the flight hours by MDS for the unit

    @param unit: (auto_dsr.models.Unit) the Unit to draw the summary page for
    @param canvas: (Canvas) the canvas on which to draw the summary page
    @param page_number: (int) the page number in the overall document
    @param logos: dict[str, ImageReader] a dictionary of logos to cache read units
    @param include_uas: (bool) a boolean flag indicating if UAS should be included

    @returns (int) next page number to generate
    """
    # Fetch and prepare unit DSR data
    dsr_data = fetch_dsr_data_for(unit)
    if len(dsr_data) == 0:
        return
    aircraft_dsr_data, uas_dsr_data = prepare_dsr_data(dsr_data)
    if len(aircraft_dsr_data) > 0:
        unit_details_tables = generate_dsr_tables(canvas, aircraft_dsr_data)
        while len(unit_details_tables) > 0:
            print("aircraft_dsr_data", len(unit_details_tables))
            page_number = draw_unit_details_page(
                unit, canvas, page_number, logos, unit_details_tables, aircraft_dsr_data
            )

    if len(uas_dsr_data) > 0 and include_uas:
        unit_details_tables = generate_dsr_tables(canvas, uas_dsr_data, aircraft=False)
        while len(unit_details_tables) > 0:
            print("uas_dsr_data:", len(unit_details_tables))
            page_number = draw_unit_details_page(
                unit, canvas, page_number, logos, unit_details_tables, uas_dsr_data, aircraft=False
            )
    return page_number


def draw_unit_details_page(
    unit: Unit,
    canvas: Canvas,
    page_number: int,
    logos: dict[str, ImageReader],
    details_tables: list[Table],
    dsr_data: list[pd.DataFrame],
    aircraft: bool = True,
) -> int:
    """
    Draws unit details page.

    @param unit: (auto_dsr.models.Unit) the Unit to draw the summary page for
    @param canvas: (Canvas) the canvas on which to draw the summary page
    @param page_number: (int) the page number in the overall document
    @param details_tables: (list) A list of tables
    @param logos: dict[str, ImageReader] a dictionary of logos to cache read units
    @param dsr_data: list[pd.DataFrame] a list of dsr dataframes for the given unit
    @param aircraft: (bool) (default True) a boolean flag indicating if UAS should be included

    @returns (int) next page number to generate
    """
    canvas.saveState()
    details_table_frame = Frame(
        x1=QUARTER_INCH,
        y1=HALF_INCH,
        width=LANDSCAPE_FULL_FRAME_WIDTH,
        height=DSR_DETAILS_FRAME_HEIGHT,
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0,
    )
    details_table_frame.addFromList(details_tables, canvas)
    canvas.restoreState()
    generate_dsr_slants(canvas, dsr_data, aircraft)

    # Set the page's static content (names and images)
    draw_header(unit, canvas, logos)
    draw_footer(unit, canvas, page_number)
    canvas.showPage()
    return page_number + 1


def prepare_dsr_data(
    dsr_dfs: tuple[list[pd.DataFrame], list[pd.DataFrame]]
) -> tuple[list[pd.DataFrame], list[pd.DataFrame]]:
    """
    Prepare DSR DataFrames

    @param dsr_data: ([pd.DataFrame], [pd.DataFrame]) a tuple of lists of DataFrames representing
                     (manned_aircraft, unmanned_aircraft) for the unit
    @returns ([pd.DataFrame], [pd.DataFrame]) a tuple of lists of DataFrames representing
                     (manned_aircraft, unmanned_aircraft) for the unit cleaned and ready for rendering
    """
    prepared_aircraft_data = []
    prepared_uas_data = []
    aircraft_dsr_dfs, uas_dsr_dfs = dsr_dfs
    # Split these two out separately to enable future, distinct data cleaning requirements
    for sub_unit_df in aircraft_dsr_dfs:
        dsr_data = base_prepare_dsr_data(sub_unit_df)
        prepared_aircraft_data.append(dsr_data)
    for sub_unit_df in uas_dsr_dfs:
        dsr_data = base_prepare_dsr_data(sub_unit_df)
        prepared_uas_data.append(dsr_data)
    return (prepared_aircraft_data, prepared_uas_data)


def base_prepare_dsr_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare DSR DataFrame by:
    1. Creating days_down column
    2. Formatting date_down, days_down, and ecd
    3. filling na values
    4. rounding all values
    5. Creating a remarks paragraph

    @param dsr_data: (pd.DataFrame) a pandas DataFrame representing unit DSR data
    @returns (pd.DataFrame) A pandas dataframe representing prepared/cleaned DSR data
    """
    # Create days_down column
    df["days_down"] = pd.to_timedelta(date.today() - df.date_down).dt.days
    df.days_down = df.days_down.astype("Int64").astype("object")
    # Format date_down and ecd
    date_format = "%d-%b"
    df.date_down = pd.to_datetime(df.date_down).dt.strftime(date_format)
    df.ecd = pd.to_datetime(df.ecd).dt.strftime(date_format)
    # Fill all NA values
    df = df.fillna("")
    # Round all values
    df = df.round(1)
    # Create remarks column
    df.remarks = [Paragraph(remarks, style=REMARKS_STYLE) if remarks else "" for remarks in df.remarks]
    # Modify Field status Aircraft to be NMCM
    df["status"] = df["status"].replace("FIELD", "NMCM")
    return df
