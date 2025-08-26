from reportlab.lib import colors
from reportlab.pdfgen.canvas import Canvas
from reportlab.graphics.shapes import Drawing, String, Line
from reportlab.graphics.renderPDF import draw
from reportlab.graphics.charts.barcharts import VerticalBarChart

from reports.daily_status_report.constants import GRAPH_LOCATIONS, PHASE_FLOW_CHART_DIMENSIONS


def draw_unit_phase_flow_graph(canvas: Canvas, model_barcharts: list[VerticalBarChart], unique_models: list[str], debug: bool = False) -> int:
    """
    Draws the unit summary page's Slant Table

    @param canvas: (Canvas) the canvas to draw on
    @param rtl_summary_table: (Table) the table to draw on the provided canvas
    @param debug: (bool) a debug
    @returns int (0, 1) 0 if successful, 1 if drawing fails (insufficient space - too many rows)
    """
    if len(unique_models) == 1:
        size_multiplier = 2
    else:
        size_multiplier = 1
    canvas.setFont('Roboto', 12)
    try:
        for i in range(0, len(model_barcharts)):
            canvas.saveState()
            drawing = Drawing(400*size_multiplier, 200*size_multiplier)
            drawing.add(model_barcharts[i])
            if size_multiplier == 2:
                x = GRAPH_LOCATIONS["single_model"]["x"]
                y = GRAPH_LOCATIONS["single_model"]["y"]
            else:
                try:
                    x = GRAPH_LOCATIONS[i]["x"]
                    y = GRAPH_LOCATIONS[i]["y"]
                except:
                    x = GRAPH_LOCATIONS[0]["x"]
                    y = GRAPH_LOCATIONS[0]["y"]               
            title = String(200*size_multiplier, 180*size_multiplier, unique_models[i], fontSize=14, textAnchor='middle', fontName= 'Roboto-Bold')
            drawing.add(title)
            diagonal =  Line(50*size_multiplier, 175*size_multiplier, 350*size_multiplier, 50*size_multiplier)
            diagonal.strokeColor = colors.black
            diagonal.strokeWidth = 1
            drawing.add(diagonal)
            horizontal = Line(50*size_multiplier, 112.5*size_multiplier, 350*size_multiplier, 112.5*size_multiplier)
            horizontal.strokeColor = colors.black
            horizontal.strokeWidth = .5
            horizontal.strokeDashArray = [1,2]
            drawing.add(horizontal)
            draw(drawing, canvas, x, y)
            canvas.restoreState()
        return 0
    except Exception as e:
        if debug:
            print(f"Error: {e}")
        return 1
