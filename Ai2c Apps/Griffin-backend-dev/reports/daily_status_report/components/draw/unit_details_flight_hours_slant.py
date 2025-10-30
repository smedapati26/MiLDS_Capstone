from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table

from reports.generator.constants import DSR_SLANT_FRAME_START, HALF_INCH, LANDSCAPE_FULL_FRAME_WIDTH, QUARTER_INCH


def draw_flight_hours_slant(canvas: Canvas, flight_hours_slant_table: Table) -> int:
    """
    Draws a unit's DSR flight hours Slant table

    @param canvas: (Canvas) The canvas to draw on
    @param flight_hours_slant_table: (Table) the flight hours slant table to draw
    @returns (int)
    """
    canvas.saveState()
    dsr_flight_hours_frame = Frame(
        x1=QUARTER_INCH + (4 * LANDSCAPE_FULL_FRAME_WIDTH / 8),
        y1=DSR_SLANT_FRAME_START,
        width=LANDSCAPE_FULL_FRAME_WIDTH * 4 / 8,
        height=HALF_INCH - 2,
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0,
    )

    res = dsr_flight_hours_frame.add(flight_hours_slant_table, canvas)
    canvas.restoreState()
    return res
