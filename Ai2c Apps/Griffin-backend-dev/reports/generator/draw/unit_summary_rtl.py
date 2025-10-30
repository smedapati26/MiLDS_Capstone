import pandas as pd
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table, TableStyle

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from reports.generator.constants import (
    HALF_INCH,
    LANDSCAPE_FULL_FRAME_WIDTH,
    QUARTER_INCH,
    RTL_TABLE_FONT_SIZE,
    THREE_QUARTER_INCH,
    inch,
)
from reports.generator.utils import classify_mds
from uas.models import UAV


def draw_unit_rtl_summary(unit: Unit, canvas: Canvas, include_uav: bool = True):
    """
    Draws the unit summary page's Slant Table

    @param unit: (auto_dsr.models.Unit) the Unit to fetch unit summary data for
    @param canvas: (Canvas) the canvas to draw on
    @param include_uav: (bool) (defaults True) if Unmanned Aerial Vehicles should be
                        included in the export (if the unit has any)
    """
    canvas.saveState()
    # 1. Create frame
    rtl_summary_table_frame = Frame(
        x1=QUARTER_INCH,
        y1=HALF_INCH,
        width=LANDSCAPE_FULL_FRAME_WIDTH / 3,
        height=4.5 * inch,
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0,
    )
    # rtl_summary_table_frame.drawBoundary(canvas)
    # 2. Fetch rtl summary data
    rtl_summary_df = fetch_rtl_summary_data_for(unit, include_uav)
    # 3. Create and Format Table
    rtl_summary_table = create_rtl_summary_table(rtl_summary_df)
    # 4. Draw Table
    rtl_summary_table_frame.add(rtl_summary_table, canvas)
    canvas.restoreState()


def create_rtl_summary_table(rtl_df: pd.DataFrame):
    """
    Creates a formatted RTL summary table given an appropriately made DataFrame
    """
    rtl_summary_table_style = style_rtl_summary_table(rtl_df)
    header_1 = ["Location", "Model", "On Hand", "RTL", "", "NRTL", ""]
    header_2 = ["", "", "", "#", "%", "#", "%"]
    fields = ["on_hand", "RTL", "RTL_perc", "NRTL", "NRTL_perc"]
    col_widths = [THREE_QUARTER_INCH - 10, THREE_QUARTER_INCH - 10, THREE_QUARTER_INCH - 10, *[QUARTER_INCH + 12] * 4]
    return Table(
        [header_1, header_2, *rtl_df[fields].to_records().tolist()], colWidths=col_widths, style=rtl_summary_table_style
    )


def style_rtl_summary_table(rtl_df: pd.DataFrame) -> TableStyle:
    """
    Creates the appropriate styling for the RTL summary table

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


def fetch_rtl_summary_data_for(unit: Unit, include_uav: bool = True) -> pd.DataFrame:
    """
    Fetches RTL Summary DataFrame for the given unit

    @param unit: (auto_dsr.models.Unit) the unit to fetch the rtl summary for
    @param include_uav: (bool) (default True) if UAVs should be included in the summary
    @returns (pd.DataFrame) the rtl summary DataFrame for the given unit
    """
    # 1. Get all Aircraft in this unit
    aircraft_qs = Aircraft.objects.filter(uic=unit)
    if aircraft_qs:
        aircraft = list(aircraft_qs.values(*["serial", "model", "rtl", "location__name"]))
        aircraft_df = pd.DataFrame.from_records(aircraft).rename({"location__name": "location"}, axis=1)
    else:
        aircraft_df = pd.DataFrame()
    # 1a. If requested, get all UAVs in this unit
    if include_uav:
        uav_qs = UAV.objects.filter(tracked_by_unit=unit)
        if uav_qs:
            uavs = list(uav_qs.values(*["serial_number", "model", "rtl", "location__name"]))
            uav_df = pd.DataFrame.from_records(uavs).rename(
                {"serial_number": "serial", "location__name": "location"}, axis=1
            )
            aircraft_df = pd.concat([aircraft_df, uav_df])
    aircraft_df = aircraft_df.fillna({"location": " "})
    # 2. Create rtl columns
    rtl_df = (
        aircraft_df.pivot_table(index=["location", "model"], columns="rtl", aggfunc="count")
        .fillna(0)
        .astype(int)
        .droplevel(0, axis=1)
    )
    all_statuses = set(["RTL", "NRTL"])
    existing_statuses = set(rtl_df.columns)
    for missing_status in all_statuses.difference(existing_statuses):
        rtl_df[missing_status] = 0
    rtl_df["RTL_perc"] = (rtl_df.RTL / (rtl_df.RTL + rtl_df.NRTL)).map("{:.1%}".format)
    rtl_df["NRTL_perc"] = (rtl_df.NRTL / (rtl_df.RTL + rtl_df.NRTL)).map("{:.1%}".format)
    # 3. sort rtl_df by location, then type of aircraft, then MDS
    rtl_df = rtl_df.reset_index()
    rtl_df["classified_mds"] = rtl_df.apply(lambda row: classify_mds(row.model), axis=1)
    rtl_df = rtl_df.set_index(["location", "classified_mds"]).sort_index().reset_index()
    rtl_df = rtl_df.set_index(["location", "model"])
    # 4. get on hand counts by location
    on_hand_df = (
        aircraft_df.groupby(by=["location", "model"]).agg({"serial": "count"}).rename({"serial": "on_hand"}, axis=1)
    )
    return rtl_df.merge(on_hand_df, left_index=True, right_index=True)
