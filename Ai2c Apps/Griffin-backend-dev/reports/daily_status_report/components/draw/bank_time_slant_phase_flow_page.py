from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Table

from reports.generator.constants import DSR_SLANT_FRAME_START, HALF_INCH, LANDSCAPE_FULL_FRAME_WIDTH, QUARTER_INCH


def draw_bank_time_slant_phase_flow(canvas: Canvas, bank_time_table: Table) -> int:
    """
    Draws a unit's DSR bank time Slant table

    @param canvas: (Canvas) The canvas to draw on
    @param bank_time_table: (Table) the bank time table
    """
    canvas.saveState()
    dsr_bank_time_frame = Frame(
        x1=HALF_INCH,
        y1=(HALF_INCH + QUARTER_INCH),
        width=LANDSCAPE_FULL_FRAME_WIDTH * 3 / 8,
        height=HALF_INCH - 2,
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0,
    )

    res = dsr_bank_time_frame.add(bank_time_table, canvas)
    canvas.restoreState()
    return res
