from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table

from reports.generator.constants import DSR_SLANT_FRAME_START, HALF_INCH, LANDSCAPE_FULL_FRAME_WIDTH, QUARTER_INCH


def draw_rtl_slant(canvas: Canvas, rtl_slant_table: Table) -> int:
    """
    Draws a unit's DSR RTL Slant table

    @param canvas: (Canvas) The canvas to draw on
    @param rtl_slant_table: (Table) the RTL slant table to draw on the page
    """
    canvas.saveState()
    dsr_rtl_frame = Frame(
        x1=QUARTER_INCH,
        y1=DSR_SLANT_FRAME_START,
        width=LANDSCAPE_FULL_FRAME_WIDTH / 8,
        height=HALF_INCH - 2,
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0,
    )

    res = dsr_rtl_frame.add(rtl_slant_table, canvas)
    canvas.restoreState()
    return res
