from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader

from auto_dsr.models import Unit
from reports.generator.constants import PAGE_HEIGHT, PAGE_WIDTH, HALF_INCH, QUARTER_INCH, UNIT_LOGO_SIZE


def draw_header(unit: Unit, canvas: Canvas, logos: dict[str, ImageReader]):
    """
    Draws the Unit Name and header information

    @param unit: (auto_dsr.models.Unit) the Unit to draw the header for
    @param canvas: (Canvas) the canvas to draw the header on
    """
    canvas.saveState()
    canvas.setFont("Roboto-Bold", 24)
    if unit.parent_uic.logo and unit.logo:
        if unit.parent_uic.uic not in logos:
            logos[unit.parent_uic.uic] = ImageReader(unit.parent_uic.logo)
        left_logo = logos[unit.parent_uic.uic]
        if unit.uic not in logos:
            logos[unit.uic] = ImageReader(unit.logo)
        right_logo = logos[unit.uic]
    elif unit.logo:
        if unit.uic not in logos:
            logos[unit.uic] = ImageReader(unit.logo)
        left_logo = logos[unit.uic]
        right_logo = logos[unit.uic]
    else:
        left_logo = "static/auto_dsr/img/unit_logos/AFC.png"
        right_logo = "static/auto_dsr/img/unit_logos/ai2c.png"
    canvas.drawImage(
        left_logo,
        x=QUARTER_INCH,
        y=PAGE_HEIGHT - QUARTER_INCH,
        width=UNIT_LOGO_SIZE,
        height=UNIT_LOGO_SIZE,
        preserveAspectRatio=True,
        anchor="nw",
        anchorAtXY=True,
    )
    canvas.drawCentredString(PAGE_WIDTH / 2.0, PAGE_HEIGHT - HALF_INCH - 10, unit.display_name)
    canvas.drawImage(
        right_logo,
        x=PAGE_WIDTH - QUARTER_INCH,
        y=PAGE_HEIGHT - QUARTER_INCH,
        width=UNIT_LOGO_SIZE,
        height=UNIT_LOGO_SIZE,
        preserveAspectRatio=True,
        anchor="ne",
        anchorAtXY=True,
    )
    canvas.restoreState()
