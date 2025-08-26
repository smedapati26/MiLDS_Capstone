from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
import pandas as pd

from auto_dsr.models import Unit
from reports.base import Page
from reports.daily_status_report.daily_status_config import DailyStatusConfig
from reports.daily_status_report.data.fetch import unit_details_uas_data_for, unit_position_data_for
from reports.daily_status_report.components.assemble import assemble_nrtl_table
from reports.daily_status_report.components.draw import (
    draw_header,
    draw_footer,
    draw_unit_nrtl_table,
)


class UnitNRTLPage(Page):
    """
    Defines the unit NRTL Summary page (typically the last page in a PDF DSR Export)
    """

    def __init__(self, unit: Unit, config: DailyStatusConfig):
        self.unit = unit
        self.config = config
        self.aircraft_data = pd.DataFrame()
        self.clean_aircraft_data = pd.DataFrame()
        self.nrtl_data = pd.DataFrame()
        self.uas_data = pd.DataFrame()
        self.uas_nrtl_data = pd.DataFrame()
        self.unit_positions = (None, None)

    def __str__(self) -> str:
        return f"DSR Unit NRTL Summary Export Page for {self.unit.short_name}"

    def fetch_data(self):
        """
        Retrieves data for the NRTL Summary page
        """
        self.unit_positions = unit_position_data_for(self.unit)
        if self.config.include_uas:
            self.uas_data = unit_details_uas_data_for(self.unit)

    def prepare_data(self):
        """
        Prepares data for the NRTL Summary page
        """
        pass

    def assemble_representation(self):
        """
        Assembles representations for the NRTL Summary Page
        """

        if not self.aircraft_data.empty:
            self.nrtl_data = self.aircraft_data[self.aircraft_data["rtl"] == "NRTL"]
            self.nrtl_data = self.nrtl_data[["serial", "model", "status", "rtl", "remarks"]]
            self.nrtl_data.rename(
                columns={"serial": "Serial", "model": "Model", "status": "Status", "rtl": "RTL", "remarks": "Remarks"},
                inplace=True,
            )
            self.nrtl_table = assemble_nrtl_table(self.nrtl_data)
        if not self.uas_data.empty:
            self.uas_nrtl_data = self.uas_data[self.uas_data["rtl"] == "NRTL"]
            self.uas_nrtl_data = self.uas_nrtl_data[["serial_number", "model", "status", "rtl", "remarks"]]
            self.uas_nrtl_data.rename(
                columns={
                    "serial_number": "Serial",
                    "model": "Model",
                    "status": "Status",
                    "rtl": "RTL",
                    "remarks": "Remarks",
                },
                inplace=True,
            )
            self.uas_nrtl_table = assemble_nrtl_table(self.uas_nrtl_data)

    def draw_representation(
        self, canvas: Canvas, logos: dict[str, ImageReader], positions: tuple[str, str, str], page_number: int
    ) -> int:
        """
        Draws the representation for the NRTL Summary  Page

        @param canvas (Canvas) the reportLab canvas object to draw on
        @param logos (dict[str, ImageReader]) a dictionary containing logos for the units rendered
        @param positions (tuple[str, str]) a tuple containing string representations of the unit OIC and NCOIC
        @param page_number (int) the current number of the page to draw
        @returns (int) the next page number to draw
        """
        next_page_number = page_number
        if not self.nrtl_data.empty:

            # Draw header and footer
            draw_header(self.unit, canvas, logos, subheader="NRTL Summary - Rotary Wing")
            draw_footer(self.unit, canvas, next_page_number, positions)
            next_page_number += 1
            # Draw report content
            draw_unit_nrtl_table(canvas, self.nrtl_table)
            # Finish page
            canvas.showPage()

        if not self.uas_nrtl_data.empty:
            # Draw header and footer
            draw_header(self.unit, canvas, logos, subheader="NRTL Summary - UAS")
            draw_footer(self.unit, canvas, next_page_number, positions)
            next_page_number += 1

            # Draw UAS report content
            draw_unit_nrtl_table(canvas, self.uas_nrtl_table)

            # Finish page
            canvas.showPage()
        return next_page_number
