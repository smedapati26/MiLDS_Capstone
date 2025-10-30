from datetime import date
from io import BytesIO

import pandas as pd
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas

from auto_dsr.model_utils import UnitEchelon
from auto_dsr.models import Unit
from reports.base import ReportBase
from reports.base.report_format import ReportFormat
from reports.daily_status_report.daily_status_config import DailyStatusConfig
from reports.daily_status_report.data.fetch import unit_details_aircraft_data_for
from reports.daily_status_report.pages import (
    UnitDetailsPage,
    UnitForscomReportPage,
    UnitNRTLPage,
    UnitPhaseFlowPage,
    UnitSummaryPage,
)
from reports.daily_status_report.pdf import register_document, reportlab_setup


class DailyStatusReport(ReportBase):
    def __init__(self, config: DailyStatusConfig, unit: Unit):
        self.config = config
        self.unit = unit
        self.aircraft_data = pd.DataFrame()
        self.pages = self.initialize_pages()
        self.filename = "%s DSR %s.pdf" % (self.unit.short_name, date.today().isoformat())
        self.page_number = 1
        if self.config.format == ReportFormat.PDF:
            # 0. Initialize logos dictionary
            self.logos = {}

            # 1. Register Fonts and setup
            reportlab_setup()

            # 2. Create PDF Canvas
            if self.config.debug:
                self.file: canvas.Canvas = canvas.Canvas(self.filename, pagesize=landscape(letter))
            else:
                self.file_buffer = BytesIO()
                self.file: canvas.Canvas = canvas.Canvas(self.file_buffer, pagesize=landscape(letter))
            # 2a. Register document metadata
            register_document(self.file, self.filename)

    def __str__(self):
        return f"DSR Export for {self.unit.short_name}. Configuration: \n{self.config}"

    def initialize_pages(self):
        """
        Initializes the pages the user requested from the DSR export

        Initial implementation includes a UnitSummaryPage (for each brigade) and
        a UnitDetailsPage (for each battalion)
        """

        if "summary" in self.config.custom_pages:
            pages = [UnitSummaryPage(self.unit, self.config)]
        else:
            pages = []
        units_with_no_subordinate_report = [UnitEchelon.COMPANY, UnitEchelon.BATTALION]
        if self.unit.echelon in units_with_no_subordinate_report:
            if "details" in self.config.custom_pages:
                pages.append(UnitDetailsPage(self.unit, self.config))
            if "phase" in self.config.custom_pages:
                pages.append(UnitPhaseFlowPage(self.unit, self.config))
            if "nrtl" in self.config.custom_pages:
                pages.append(UnitNRTLPage(self.unit, self.config))
        elif self.unit.echelon == UnitEchelon.BRIGADE:
            if "forscom" in self.config.custom_pages:
                pages.append(UnitForscomReportPage(self.unit, self.config))
            for unit in Unit.objects.filter(parent_uic=self.unit):
                if "details" in self.config.custom_pages:
                    pages.append(UnitDetailsPage(unit, self.config))
                if "phase" in self.config.custom_pages:
                    pages.append(UnitPhaseFlowPage(unit, self.config))
                if "nrtl" in self.config.custom_pages:
                    pages.append(UnitNRTLPage(unit, self.config))
        elif self.unit.echelon in [UnitEchelon.DIVISION, UnitEchelon.CORPS, UnitEchelon.ACOM]:
            for subordinate_unit in Unit.objects.filter(
                uic__in=self.unit.subordinate_uics, echelon=UnitEchelon.BRIGADE
            ):
                if "forscom" in self.config.custom_pages:
                    pages.append(UnitForscomReportPage(subordinate_unit, self.config))
        return pages

    def generate_report(self):
        return super().generate_report()

    def fetch_data(self):
        aircraft_data = {}
        units_with_no_subordinate_report = [UnitEchelon.COMPANY, UnitEchelon.BATTALION]
        if self.unit.echelon in units_with_no_subordinate_report:
            aircraft_data[self.unit.uic] = unit_details_aircraft_data_for(
                unit=self.unit,
                custom_insp=self.config.custom_insp,
                custom_mods=self.config.custom_mods,
                custom_models=self.config.custom_models,
                history_date=self.config.history_date,
            )
        elif self.unit.echelon == UnitEchelon.BRIGADE:
            for unit in Unit.objects.filter(parent_uic=self.unit):
                aircraft_data[unit.uic] = unit_details_aircraft_data_for(
                    unit=unit,
                    custom_insp=self.config.custom_insp,
                    custom_mods=self.config.custom_mods,
                    custom_models=self.config.custom_models,
                    history_date=self.config.history_date,
                )

        for page in self.pages:
            try:
                page.aircraft_data = aircraft_data[page.unit.uic].copy()
            except:
                page.aircraft_data = pd.DataFrame()
            page.fetch_data()

    def prepare_data(self):
        for page in self.pages:
            page.prepare_data()

    def assemble_representation(self):
        for page in self.pages:
            page.assemble_representation()

    def draw_representation(self):
        if self.config.format == ReportFormat.PDF:
            for page in self.pages:
                self.page_number = page.draw_representation(
                    self.file, self.logos, page.unit_positions, self.page_number
                )

    def save(self):
        if self.config.format == ReportFormat.PDF:
            self.file.save()
