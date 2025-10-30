from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table

from reports.daily_status_report.constants import (
    DSR_DETAILS_FRAME_HEIGHT,
    HALF_INCH,
    LANDSCAPE_FULL_FRAME_WIDTH,
    QUARTER_INCH,
)


def draw_unit_details_table(canvas: Canvas, details_tables: list[Table]):
    """
    Draws unit details page.

    @param canvas: (Canvas) the canvas on which to draw the summary page
    @param details_tables: (list) A list of tables to draw

    @returns (int) (0, 1) a numerical flag indicating if all tables were successfully drawn
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
