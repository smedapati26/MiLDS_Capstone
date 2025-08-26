from datetime import date
import pandas as pd
from reportlab.platypus import Paragraph

from reports.daily_status_report.constants import REMARKS_STYLE


def base_prepare_dsr_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare DSR DataFrame by:
    1. Creating days_down column
    2. Formatting date_down, days_down, and ecd
    3. filling na values
    4. rounding all values
    5. Creating a remarks paragraph

    @param dsr_data: (pd.DataFrame) a pandas DataFrame representing unit DSR data
    @returns (pd.DataFrame) A pandas dataframe representing prepared/cleaned DSR data
    """
    # Create days_down column
    df["days_down"] = pd.to_timedelta(date.today() - df.date_down).dt.days
    df.days_down = df.days_down.astype("Int64").astype("object")
    # Format date_down and ecd
    date_format = "%d-%b"
    df.date_down = pd.to_datetime(df.date_down).dt.strftime(date_format)
    df.ecd = pd.to_datetime(df.ecd).dt.strftime(date_format)
    # Fill all NA values
    df = df.fillna("")
    # Round all values
    df = df.round(1)
    # Create remarks column
    df.remarks = [Paragraph(remarks, style=REMARKS_STYLE) if remarks else "" for remarks in df.remarks]
    # Modify Field status Aircraft to be NMCM
    df["status"] = df["status"].replace("FIELD", "NMCM")
    return df
