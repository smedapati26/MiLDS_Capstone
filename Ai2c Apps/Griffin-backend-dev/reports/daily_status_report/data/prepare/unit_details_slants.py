import pandas as pd


def prepare_dsr_slants(df: pd.DataFrame, uas: bool = False) -> pd.DataFrame:
    """
    Prepare DSR DataFrame slants by:
    1. subsetting the dataframe provided

    @param df: (pd.DataFrame) a pandas DataFrame representing unit DSR data
    @param uas: (bool) a boolean flag indicating if the dataframe is for UAS
    @returns (pd.DataFrame) A pandas dataframe representing prepared/cleaned DSR data
    """
    if uas:
        try:
            slant_columns = ["serial_number", "model", "status", "rtl", "flight_hours"]
            dsr_slant_df = df[df.type == "vehicle"][slant_columns]
        except:
            return pd.DataFrame()
    else:
        slant_columns = ["serial", "model", "status", "rtl", "flight_hours", "hours_to_phase"]
        dsr_slant_df = df[slant_columns]

    return dsr_slant_df
