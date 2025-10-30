from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def reportlab_setup():
    """
    Register fonts and other ReportLab setup
    """
    pdfmetrics.registerFont(TTFont("Roboto", "static/auto_dsr/fonts/Roboto/Roboto-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("Roboto-Bold", "static/auto_dsr/fonts/Roboto/Roboto-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Roboto-Italic", "static/auto_dsr/fonts/Roboto/Roboto-Italic.ttf"))
    pdfmetrics.registerFont(TTFont("Roboto-BoldItalic", "static/auto_dsr/fonts/Roboto/Roboto-BoldItalic.ttf"))
