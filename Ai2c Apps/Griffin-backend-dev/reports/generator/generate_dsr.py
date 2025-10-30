from datetime import date
from io import BytesIO

from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas

from auto_dsr.model_utils import UnitEchelon
from auto_dsr.models import Unit
from reports.generator import register_document
from reports.generator.draw.unit_details_page import generate_unit_details
from reports.generator.draw.unit_summary_page import draw_unit_summary_page
from reports.generator.reportlab_setup import reportlab_setup


def generate_dsr(unit: Unit, include_uas: bool = True, debug: bool = False) -> tuple[BytesIO, str]:
    """
    Generates a unit DSR using reportLab's open source PDF Generation Library

    @param unit: (auto_dsr.models.Unit) the unit to generate the DSR for
    @param include_uas: (bool) (default True) a boolean flag indicating if UAS should be included
    @param debug: (bool) a boolean flag indicating if the report should be locally generated
    @returns: (BytesIO, str) A tuple of the DSR PDF as a byte stream and the filename
    """
    # 1. Register Fonts and setup
    reportlab_setup()

    # 2. Create PDF Canvas
    pdf_filename = "%s DSR %s.pdf" % (unit.short_name, date.today().isoformat())
    if debug:
        c = canvas.Canvas(pdf_filename, pagesize=landscape(letter))
    else:
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(letter))
    # 2a. Register document metadata
    register_document(c, pdf_filename)

    # 2b. Initialize dictionary with logos used for this document
    # {uic: ImageReader}
    logos = {}

    page_number = 1
    # 3. Draw Unit Summary Page
    draw_unit_summary_page(unit, c, page_number, logos, include_uas)
    page_number += 1

    # 4. Draw Unit Details Page(s)
    if unit.echelon == UnitEchelon.BRIGADE:
        for subordinate_unit in Unit.objects.filter(uic__in=unit.child_uics):
            page_number = generate_unit_details(subordinate_unit, c, page_number, logos, include_uas)
    elif unit.echelon == UnitEchelon.BATTALION:
        page_number = generate_unit_details(unit, c, page_number, logos, include_uas)

    c.save()

    if debug:  # ignore return values if in debug mode
        return

    buffer.seek(0)
    return buffer, pdf_filename
