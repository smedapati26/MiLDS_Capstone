from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
import pandas as pd

from auto_dsr.models import Unit
from reports.base import Page
from reports.daily_status_report.daily_status_config import DailyStatusConfig
from reports.daily_status_report.data.fetch import (
    unit_slant_data_for,
    unit_summary_rtl_data_for,
    unit_position_data_for,
)
from reports.daily_status_report.components.assemble import assemble_slant_table, assemble_rtl_summary_table
from reports.daily_status_report.components.draw import (
    draw_header,
    draw_footer,
    draw_unit_rtl_summary,
    draw_unit_summary_slant,
)


class UnitSummaryPage(Page):
    """
    Defines the unit summary page (typically the first page in a PDF DSR Export)
    """

    def __init__(self, unit: Unit, config: DailyStatusConfig):
        self.unit = unit
        self.config = config
        self.unit_positions = (None, None)
        self.aircraft_data = pd.DataFrame()

    def __str__(self) -> str:
        return f"DSR Unit Summary Export Page for {self.unit.short_name}"

    def fetch_data(self):
        """
        Retrieves data for the Unit Summary page
        """
        self.unit_positions = unit_position_data_for(self.unit)
        self.slant_data = unit_slant_data_for(self.unit, self.config.include_uas)
        self.rtl_data = unit_summary_rtl_data_for(self.unit, self.config.include_uas)

    def prepare_data(self):
        """
        Prepares data for the Unit Summary page
        """
        pass

    def assemble_representation(self):
        """
        Assembles representations for the Unit Summary Page
        """
        self.slant_table = assemble_slant_table(self.slant_data)
        self.rtl_table = assemble_rtl_summary_table(self.rtl_data)

    def draw_representation(
        self, canvas: Canvas, logos: dict[str, ImageReader], positions: tuple[str, str, str], page_number: int
    ) -> int:
        """
        Draws the representation for the Unit Summary Page

        @param canvas (Canvas) the reportLab canvas object to draw on
        @param logos (dict[str, ImageReader]) a dictionary containing logos for the units rendered
        @param positions (tuple[str, str]) a tuple containing string representations of the unit OIC and NCOIC
        @param page_number (int) the current number of the page to draw
        @returns (int) the next page number to draw
        """
        # Draw header and footer
        draw_header(self.unit, canvas, logos)
        draw_footer(self.unit, canvas, page_number, positions)

        # Draw report content
        draw_unit_rtl_summary(canvas, self.rtl_table, self.config.debug)
        draw_unit_summary_slant(canvas, self.slant_table, self.config.debug)

        # Finish page
        canvas.showPage()
        return page_number + 1
