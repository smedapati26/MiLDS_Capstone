from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table

from reports.daily_status_report.constants import HALF_INCH, QUARTER_INCH, LANDSCAPE_FULL_FRAME_WIDTH, inch


def draw_unit_rtl_summary(canvas: Canvas, rtl_summary_table: Table, debug: bool = False) -> int:
    """
    Draws the unit summary page's Slant Table

    @param canvas: (Canvas) the canvas to draw on
    @param rtl_summary_table: (Table) the table to draw on the provided canvas
    @param debug: (bool) a debug
    @returns int (0, 1) 0 if successful, 1 if drawing fails (insufficient space - too many rows)
    """
    location_column_width = rtl_summary_table._colWidths[0]

    canvas.saveState()
    # 1. Create frame
    rtl_summary_table_frame = Frame(
        x1=QUARTER_INCH,
        y1=HALF_INCH,
        width=LANDSCAPE_FULL_FRAME_WIDTH / 3,
        height=4.5 * inch,
        topPadding=0,
        bottomPadding=0,
        leftPadding=location_column_width - 54,
        rightPadding=0,
    )
    if debug:
        rtl_summary_table_frame.drawBoundary(canvas)
    # 2. Draw Table
    res = rtl_summary_table_frame.add(rtl_summary_table, canvas)
    canvas.restoreState()
    return res
