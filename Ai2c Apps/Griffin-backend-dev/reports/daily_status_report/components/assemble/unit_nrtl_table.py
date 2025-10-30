import pandas as pd
from reportlab.platypus import Image, Table

from reports.daily_status_report.constants import LANDSCAPE_FULL_FRAME_WIDTH
from reports.daily_status_report.utils import dataframe_to_table


def assemble_nrtl_table(nrtl_data: pd.DataFrame) -> Table:
    """
    Given a pandas dataframe return a ReportLab Table for NRTL Aircraft

    @param df: (pd.DataFrame) the dataframe to make into a table
    @returns (reportlab.platypus.Table) the Table object to paint on the canvas (already fully formatted)
    """

    nrtl_data.loc[:, "Status"] = nrtl_data.loc[:, "Status"].replace("FIELD", "NMCM")
    return dataframe_to_table(nrtl_data, [75, 75, 50, 50, 50, LANDSCAPE_FULL_FRAME_WIDTH - 300])
