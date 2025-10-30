from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table

from reports.daily_status_report.constants import LANDSCAPE_FULL_FRAME_WIDTH, PAGE_HEIGHT, QUARTER_INCH, inch


def draw_unit_summary_slant(canvas: Canvas, slant_table: Table, debug: bool = False) -> int:
    """
    Draws the unit summary page's Slant Table

    @param canvas: (Canvas) the canvas to draw on
    @param slant_table: (Table) the Table to draw on the provided canvas

    @returns int (0, 1) 0 if successful, 1 if drawing fails (insufficient space - too many rows)
    """
    canvas.saveState()
    # 1. Create frame
    slant_table_frame = Frame(
        x1=QUARTER_INCH,
        y1=0.6 * PAGE_HEIGHT,
        width=LANDSCAPE_FULL_FRAME_WIDTH,
        height=2.38 * inch,
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0,
    )
    if debug:
        slant_table_frame.drawBoundary(canvas)
    # 2. Draw Table
    res = slant_table_frame.add(slant_table, canvas)
    canvas.restoreState()
    return res
