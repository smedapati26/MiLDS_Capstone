from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
import pandas as pd

from auto_dsr.models import Unit
from reports.base import Page
from reports.daily_status_report.daily_status_config import DailyStatusConfig
from reports.daily_status_report.data.fetch import (
    unit_position_data_for,
    unit_rw_data_for,
    unit_uas_data_for,
    unit_rw_fhp_data_for,
)
from reports.daily_status_report.components.draw import draw_report


class UnitForscomReportPage(Page):
    """
    Defines the unit summary page (typically the first page in a PDF DSR Export)
    """

    def __init__(self, unit: Unit, config: DailyStatusConfig):
        self.unit = unit
        self.config = config
        self.unit_positions = (None, None, None)
        self.aircraft_data = pd.DataFrame()
        self.aircraft_fhp_data = pd.DataFrame()
        self.uas_data = pd.DataFrame()

    def __str__(self) -> str:
        return f"DSR Unit Summary Export Page for {self.unit.short_name}"

    def fetch_data(self):
        """
        Retrieves data for the Unit Summary page
        """
        self.unit_positions = unit_position_data_for(self.unit)
        self.aircraft_data = unit_rw_data_for(self.unit)
        if not self.aircraft_data.empty:
            self.aircraft_fhp_data = unit_rw_fhp_data_for(self.unit)
            self.uas_data = unit_uas_data_for(self.unit)

    def prepare_data(self):
        """
        Prepares data for the Unit Summary page
        """
        pass

    def assemble_representation(self):
        """
        Assembles representations for the Unit Summary Page
        """
        pass

    def draw_representation(self, canvas: Canvas, logos: dict[str, ImageReader], positions: tuple[str, str, str], page_number: int) -> int:
        """
        Draws the representation for the Unit Summary Page

        @param canvas (Canvas) the reportLab canvas object to draw on
        @param logos (dict[str, ImageReader]) a dictionary containing logos for the units rendered
        @param positions (tuple[str, str]) a tuple containing string representations of the unit OIC and NCOIC
        @param page_number (int) the current number of the page to draw
        @returns (int) the next page number to draw
        """
        next_page_number = page_number
        if not self.aircraft_data.empty:
            next_page_number += 1
            # Draw report content
            draw_report(self.unit, canvas, logos, self.aircraft_data, self.uas_data, self.aircraft_fhp_data, self.unit_positions)
            # Finish page
            canvas.showPage()

        return next_page_number
