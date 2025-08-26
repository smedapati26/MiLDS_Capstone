from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
import pandas as pd

from auto_dsr.models import Unit
from reports.base import Page
from reports.daily_status_report.daily_status_config import DailyStatusConfig
from reports.daily_status_report.data.fetch import unit_position_data_for
from reports.daily_status_report.data.prepare import base_prepare_dsr_data, prepare_dsr_slants
from reports.daily_status_report.components.assemble import assemble_phase_flow_graph, assemble_bank_time_slant
from reports.daily_status_report.components.draw import (
    draw_header,
    draw_footer,
    draw_unit_phase_flow_graph,
    draw_bank_time_slant_phase_flow,
)


class UnitPhaseFlowPage(Page):
    """
    Defines the unit phase flow page (typically the second to last page in a PDF DSR Export)
    """

    def __init__(self, unit: Unit, config: DailyStatusConfig):
        self.unit = unit
        self.config = config
        self.unit_positions = (None, None)
        self.aircraft_data = pd.DataFrame()
        self.phase_flow_data = pd.DataFrame()
        self.clean_phase_flow_data = pd.DataFrame()
        self.single_model = True

    def __str__(self) -> str:
        return f"DSR Unit Phase Flow Export Page for {self.unit.short_name}"

    def fetch_data(self):
        """
        Retrieves data for the Phase Flow page
        """
        self.unit_positions = unit_position_data_for(self.unit)

    def prepare_data(self):
        """
        Prepares data for the Phase Flow page
        """
        if not self.aircraft_data.empty:
            self.clean_aircraft_data = base_prepare_dsr_data(self.aircraft_data)
            self.clean_aircraft_slants_data = prepare_dsr_slants(self.clean_aircraft_data)
            try:
                self.phase_flow_data = self.aircraft_data[
                    ["serial", "model", "current_unit", "hours_to_phase", "320 Hour_insp"]
                ]
            except:
                self.phase_flow_data = self.aircraft_data[["serial", "model", "current_unit", "hours_to_phase"]]
            self.unique_models = sorted(self.phase_flow_data["model"].unique().tolist())
            self.model_dfs = [
                (self.phase_flow_data[self.phase_flow_data["model"] == model], model) for model in self.unique_models
            ]
            if len(self.model_dfs) == 1:
                self.single_model = True
            else:
                self.single_model = False

    def assemble_representation(self):
        """
        Assembles representations for the Phase Flow Page
        """
        if not self.phase_flow_data.empty:
            self.bank_time_slant = assemble_bank_time_slant(self.clean_aircraft_slants_data)
            self.model_flow_graphs = [
                assemble_phase_flow_graph(model[0], model[1], self.single_model) for model in self.model_dfs
            ]

    def draw_representation(
        self, canvas: Canvas, logos: dict[str, ImageReader], positions: tuple[str, str, str], page_number: int
    ) -> int:
        """
        Draws the representation for the Phase Flow Page

        @param canvas (Canvas) the reportLab canvas object to draw on
        @param logos (dict[str, ImageReader]) a dictionary containing logos for the units rendered
        @param positions (tuple[str, str]) a tuple containing string representations of the unit OIC and NCOIC
        @param page_number (int) the current number of the page to draw
        @returns (int) the next page number to draw
        """
        next_page_number = page_number
        if not self.phase_flow_data.empty:
            # Draw header and footer
            draw_header(self.unit, canvas, logos, subheader="Phase Flow")
            draw_footer(self.unit, canvas, next_page_number, positions)

            # Draw report content
            draw_unit_phase_flow_graph(canvas, self.model_flow_graphs, self.unique_models, self.config.debug)
            draw_bank_time_slant_phase_flow(canvas, self.bank_time_slant)
            # Finish page
            canvas.showPage()
            next_page_number += 1
        return next_page_number
