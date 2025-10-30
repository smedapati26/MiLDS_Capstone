from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

from auto_dsr.models import Unit
from reports.daily_status_report.constants import HALF_INCH, PAGE_HEIGHT, PAGE_WIDTH, QUARTER_INCH, UNIT_LOGO_SIZE, inch


def draw_header(unit: Unit, canvas: Canvas, logos: dict[str, ImageReader], subheader: str = None):
    """
    Draws the Unit Name and header information

    @param unit: (auto_dsr.models.Unit) the Unit to draw the header for
    @param canvas: (Canvas) the canvas to draw the header on
    """
    canvas.saveState()
    name_length = len(unit.display_name)
    name_font_size = min(24, 1200 / name_length)
    canvas.setFont("Roboto-Bold", name_font_size)
    try:
        if unit.parent_uic and unit.parent_uic.logo and unit.logo:
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
    except:
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
    canvas.setFont("Roboto-Bold", name_font_size - 4)
    if subheader:
        canvas.drawCentredString(PAGE_WIDTH / 2.0, PAGE_HEIGHT - inch - QUARTER_INCH, subheader)

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
