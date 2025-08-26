from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table

from reports.daily_status_report.constants import (
    HALF_INCH,
    QUARTER_INCH,
    LANDSCAPE_FULL_FRAME_WIDTH,
    DSR_DETAILS_FRAME_HEIGHT,
)


def draw_unit_nrtl_table(canvas: Canvas, nrtl_table: Table):
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
        showBoundary=1,
    )
    details_table_frame.add(nrtl_table, canvas)
    canvas.restoreState()
