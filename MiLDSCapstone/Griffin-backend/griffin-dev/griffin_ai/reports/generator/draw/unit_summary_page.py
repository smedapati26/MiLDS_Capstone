from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader

from auto_dsr.models import Unit
from reports.generator.draw import draw_header, draw_footer, draw_unit_summary_slant, draw_unit_rtl_summary


def draw_unit_summary_page(
    unit: Unit, canvas: Canvas, page_number: int, logos: dict[str, ImageReader], include_uas: bool = True
) -> Canvas:
    """
    Draws the Unit Summary Page. The Unit summary page includes:
    a. A slant by model

    @param unit: (auto_dsr.models.Unit) the Unit to draw the Summary page for
    @param canvas: (Canvas) the canvas on which to draw the summary page
    @param page_number: (int) the page number in the overall document
    @param include_uas: (bool) (default True) a boolean flag indicating if UAS should be included
    """
    # 4a. Write unit general information on page
    draw_header(unit, canvas, logos)
    draw_unit_summary_slant(unit, canvas, include_uas)
    draw_unit_rtl_summary(unit, canvas, include_uas)
    draw_footer(unit, canvas, page_number)
    canvas.showPage()
