import pandas as pd
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

from auto_dsr.models import Unit
from reports.base import Page
from reports.daily_status_report.components.assemble import (
    assemble_aircraft_details_table,
    assemble_bank_time_slant,
    assemble_flight_hours_slant,
    assemble_rtl_slant,
    assemmble_uas_details_table,
)
from reports.daily_status_report.components.draw import (
    draw_bank_time_slant,
    draw_flight_hours_slant,
    draw_footer,
    draw_header,
    draw_rtl_slant,
    draw_unit_details_table,
)
from reports.daily_status_report.daily_status_config import DailyStatusConfig
from reports.daily_status_report.data.fetch import unit_details_uas_data_for, unit_position_data_for
from reports.daily_status_report.data.prepare import base_prepare_dsr_data, prepare_dsr_slants


class UnitDetailsPage(Page):
    """
    Defines a unit details page in the DSR export
    """

    def __init__(self, unit: Unit, config: DailyStatusConfig):
        self.unit = unit
        self.config = config
        self.uas_data = pd.DataFrame()
        self.aircraft_data = pd.DataFrame()
        self.clean_aircraft_data = pd.DataFrame()
        self.clean_aircraft_slants_data = pd.DataFrame()
        self.clean_uas_data = pd.DataFrame()
        self.clean_uas_slants_data = pd.DataFrame()
        self.unit_positions = (None, None)

    def __str__(self) -> str:
        return f"DSR Details Export Page for: {self.unit.short_name}"

    def fetch_data(self):
        """
        Retrieves data for the Unit Details page
        """
        self.unit_positions = unit_position_data_for(self.unit)
        if self.config.include_uas:
            self.uas_data = unit_details_uas_data_for(self.unit)

    def prepare_data(self):
        """
        Prepares data for the Unit Details page
        """
        if not self.aircraft_data.empty:
            self.clean_aircraft_data = base_prepare_dsr_data(self.aircraft_data)
            self.clean_aircraft_slants_data = prepare_dsr_slants(self.clean_aircraft_data)
        if self.config.include_uas and not self.uas_data.empty:
            self.clean_uas_data = base_prepare_dsr_data(self.uas_data)
            self.clean_uas_slants_data = prepare_dsr_slants(self.clean_uas_data, uas=True)

    def assemble_representation(self):
        """
        Assembles representations for the Unit Details Page
        """
        if not self.clean_aircraft_data.empty:
            self.bank_time_slant = assemble_bank_time_slant(self.clean_aircraft_slants_data)
            self.rtl_slant = assemble_rtl_slant(self.clean_aircraft_slants_data)
            self.flight_hours_slant = assemble_flight_hours_slant(self.clean_aircraft_slants_data)
            unique_units = sorted(self.clean_aircraft_data["current_unit"].unique().tolist())
            special_columns = [colname for colname in self.clean_aircraft_data.columns if colname.endswith("_insp")]
            mods_columns = [colname for colname in self.clean_aircraft_data.columns if colname.endswith("_mods")]
            special_columns.extend(mods_columns)

            unit_details_dfs = [
                self.clean_aircraft_data[self.clean_aircraft_data["current_unit"] == unit] for unit in unique_units
            ]
            clean_unit_details_dfs = []
            for df in unit_details_dfs:
                df: pd.DataFrame = df.copy()
                for colname in special_columns:
                    df.loc[:, colname] = df.loc[:, colname].replace("", pd.NA)
                df.dropna(axis=1, how="all", inplace=True)
                df.fillna("", inplace=True)
                clean_unit_details_dfs.append(df)

            insp_col_counts = [
                len([colname for colname in dsr_df.columns if colname.endswith("_insp")])
                for dsr_df in clean_unit_details_dfs
            ]
            max_len_insp_cols = max(insp_col_counts)
            mods_col_counts = [
                len([colname for colname in dsr_df.columns if colname.endswith("_mods")])
                for dsr_df in clean_unit_details_dfs
            ]
            max_len_mods_col_counts = max(mods_col_counts)

            self.aircraft_details_tables = []

            for unit_df in clean_unit_details_dfs:
                table = assemble_aircraft_details_table(unit_df, max_len_insp_cols, max_len_mods_col_counts)
                table.repeatRows = 2
                self.aircraft_details_tables.append(table)

        if self.config.include_uas and not self.clean_uas_slants_data.empty:
            self.uas_rtl_slant = assemble_rtl_slant(self.clean_uas_slants_data)
            self.uas_flight_hours_slant = assemble_flight_hours_slant(self.clean_uas_slants_data)
            unique_units = sorted(self.clean_uas_data["current_unit"].unique().tolist())
            unit_details_dfs = [
                self.clean_uas_data[self.clean_uas_data["current_unit"] == unit] for unit in unique_units
            ]
            self.uas_details_tables = [assemmble_uas_details_table(unit_df) for unit_df in unit_details_dfs]

    def draw_representation(
        self, canvas: Canvas, logos: dict[str, ImageReader], positions: tuple[str, str, str], page_number: int
    ) -> int:
        """
        Draws the representation for the Unit Details Page

        @param canvas (Canvas) the reportLab canvas object to draw on
        @param logos (dict[str, ImageReader]) a dictionary containing logos for the units rendered
        @param positions (tuple[str, str]) a tuple containing string representations of the unit OIC and NCOIC
        @param page_number (int) the current number of the page to draw
        returns (int) the next page number to draw
        """

        next_page_number = page_number
        if not self.aircraft_data.empty:
            while len(self.aircraft_details_tables) > 0:
                # Draw header and footer
                draw_header(self.unit, canvas, logos)
                draw_footer(self.unit, canvas, next_page_number, positions)
                next_page_number += 1

                # Draw Aircraft report content
                draw_bank_time_slant(canvas, self.bank_time_slant)
                draw_flight_hours_slant(canvas, self.flight_hours_slant)
                draw_rtl_slant(canvas, self.rtl_slant)
                draw_unit_details_table(canvas, self.aircraft_details_tables)

                # Finish page
                canvas.showPage()

        if not self.uas_data.empty and not self.clean_uas_slants_data.empty:
            while len(self.uas_details_tables) > 0:
                # Draw header and footer
                draw_header(self.unit, canvas, logos)
                draw_footer(self.unit, canvas, next_page_number, positions)
                next_page_number += 1

                # Draw UAS report content
                draw_flight_hours_slant(canvas, self.uas_flight_hours_slant)
                draw_rtl_slant(canvas, self.uas_rtl_slant)
                draw_unit_details_table(canvas, self.uas_details_tables)

                # Finish page
                canvas.showPage()

        return next_page_number
