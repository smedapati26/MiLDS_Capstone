import pandas as pd

from aircraft.utils import get_phase_interval
from reports.daily_status_report.constants import NMC_STATUSES, PMC_STATUSES
from reports.daily_status_report.utils import alert_formatting


def style_dsr_column(
    column: pd.Series, table_col_index: int, rule_set: str, model: pd.Series = None, row_start=1
) -> list[(str, tuple[int, int], tuple[int, int], str)]:
    """
    Given a pandas Series representing a table column, style accordingly

    @param column: (pd.Series) the pandas Series containing the values for the column to style based on
    @param table_col_index: (int) the column index value (for use when computing the coordinates)
    @param rule_set: (str) the set of different rules that can be applied to conditional formatting
    @param model: (pd.Series) (default None) the aircraft model to use if computing phase styling
    @param row_start: (int) the row index value to start highlighting, default to 1.
    @returns a list of tuples with the style to apply and the coordinates to apply it to
    """
    styles = []
    if rule_set == "status":
        for i, value in enumerate(column.to_list(), row_start):
            if value == "FMC":
                styles.extend(alert_formatting((table_col_index, i), "confirmation"))
            elif value in PMC_STATUSES:
                styles.extend(alert_formatting((table_col_index, i), "caution"))
            elif value in NMC_STATUSES:
                styles.extend(alert_formatting((table_col_index, i), "error"))
            elif value == "MTF":
                styles.extend(alert_formatting((table_col_index, i), "info"))

    elif rule_set == "inspection":
        inspection_interval = int(column.name.split(" ")[0])
        threshold = inspection_interval * 0.1
        for i, value in enumerate(column.to_list(), row_start):
            if type(value) != str and float(value) <= threshold:
                styles.extend(alert_formatting((table_col_index, i), "error"))

    elif rule_set == "phase":
        inspection_interval = get_phase_interval(model.to_list()[0])
        threshold = inspection_interval * 0.1
        for i, value in enumerate(column.to_list(), row_start):
            if float(value) <= threshold:
                styles.extend(alert_formatting((table_col_index, i), "error"))

    return styles
