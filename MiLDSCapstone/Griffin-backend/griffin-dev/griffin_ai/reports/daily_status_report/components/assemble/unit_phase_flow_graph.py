import pandas as pd
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from reportlab.graphics.shapes import Drawing, String, Line
from reportlab.graphics.charts.barcharts import VerticalBarChart

from reports.daily_status_report.constants import PHASE_FLOW_CHART_SPECS, PHASE_FLOW_CHART_DIMENSIONS


def assemble_phase_flow_graph(model_df: pd.DataFrame, model: str, single_model: bool = False) -> VerticalBarChart:
    """
    Given a Unit Summary Slant DataFrame, assembles the corresponding Slant Table

    @param slant_df: (pd.DataFrame) the slant DataFrame to make into a table
    @returns (Table) the reportlab table to draw on the page
    """
    model_df = model_df.sort_values(by=["hours_to_phase"], ascending=False)
    # Create a bar chart
    if model == "CH-47FM3":
        try:
            data = [model_df["hours_to_phase"].tolist(), model_df["320 Hour_insp"].tolist()]
        except:
            data = [model_df["hours_to_phase"].tolist()]
    else:
        data = [model_df["hours_to_phase"].tolist()]
    bar = VerticalBarChart()
    if single_model:
        bar.x = PHASE_FLOW_CHART_DIMENSIONS["single_model"]["x"]
        bar.y = PHASE_FLOW_CHART_DIMENSIONS["single_model"]["y"]
        bar.height = PHASE_FLOW_CHART_DIMENSIONS["single_model"]["height"]
        bar.width = PHASE_FLOW_CHART_DIMENSIONS["single_model"]["width"]
    else:
        bar.x = PHASE_FLOW_CHART_DIMENSIONS["multiple_models"]["x"]
        bar.y = PHASE_FLOW_CHART_DIMENSIONS["multiple_models"]["y"]
        bar.height = PHASE_FLOW_CHART_DIMENSIONS["multiple_models"]["height"]
        bar.width = PHASE_FLOW_CHART_DIMENSIONS["multiple_models"]["width"]     
    bar.data = data
    bar.strokeColor = colors.black
    bar.bars[(0)].fillColor = colors.Color(*hex_to_rgb("#00458A"))
    try:
        bar.bars[(1)].fillColor = colors.green
    except:
        pass

    try:
        bar.valueAxis.valueMin = PHASE_FLOW_CHART_SPECS[model]["min_val"]
        bar.valueAxis.valueMax = PHASE_FLOW_CHART_SPECS[model]["max_val"]
        bar.valueAxis.valueStep = PHASE_FLOW_CHART_SPECS[model]["val_step"]
    except:
        bar.valueAxis.valueMin = PHASE_FLOW_CHART_SPECS["default"]["min_val"]
        bar.valueAxis.valueMax = PHASE_FLOW_CHART_SPECS["default"]["max_val"]
        bar.valueAxis.valueStep = PHASE_FLOW_CHART_SPECS["default"]["val_step"]

    bar.categoryAxis.labels.boxAnchor = "ne"
    bar.categoryAxis.labels.dx = -5
    bar.categoryAxis.labels.dy = -5
    bar.categoryAxis.labels.angle = 90
    bar.categoryAxis.categoryNames = [str(serial) for serial in model_df["serial"].tolist()]

    return bar


def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) / 255.0 for i in (0, 2, 4))
