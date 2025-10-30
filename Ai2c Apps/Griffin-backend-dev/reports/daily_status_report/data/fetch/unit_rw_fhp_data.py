from datetime import datetime

import pandas as pd

from aircraft.models import DA_1352
from auto_dsr.models import Unit
from fhp.models import MonthlyProjection
from utils.time import get_reporting_period


def unit_rw_fhp_data_for(unit: Unit) -> pd.DataFrame:
    """
    Fetches slant DataFrame for the given unit

    @param unit: (auto_dsr.models.Unit) the unit to fetch the fhp for
    @returns (pd.DataFrame) the fhp DataFrame for the given unit
    """
    # 1. Make request for FHP data
    models = ["AH-64D", "AH-64E", "UH-60L", "UH-60M", "HH-60M", "CH-47F"]
    reporting_period = get_reporting_period()[1]
    fiscal_year_start = datetime(
        reporting_period.year - 1 if reporting_period.month < 10 else reporting_period.year, 10, 1
    )

    prediction_qs = MonthlyProjection.objects.filter(unit__in=unit.subordinate_unit_hierarchy(include_self=True))
    if prediction_qs:
        predictions = list(prediction_qs.values(*["model", "reporting_month", "projected_hours"]))
        prediction_df = pd.DataFrame.from_records(predictions)

        prediction_df["reporting_month"] = pd.to_datetime(prediction_df["reporting_month"])

        # 2. Subset df to only include predictions for the current month
        current_month_df = prediction_df[
            (prediction_df["reporting_month"].dt.year == reporting_period.year)
            & (prediction_df["reporting_month"].dt.month == reporting_period.month)
        ]
        # 3. Subset df to only include predictions for the current fiscal year
        fiscal_year_df = prediction_df[prediction_df["reporting_month"] >= fiscal_year_start]

        # 4. Sum the df by model type and then merge them
        current_month_sum = current_month_df.groupby("model")["projected_hours"].sum()
        fiscal_year_sum = fiscal_year_df.groupby("model")["projected_hours"].sum()
        models = ["AH-64D", "AH-64E", "UH-60L", "UH-60M", "HH-60M", "CH-47F"]
        predicted_df = pd.DataFrame({"month_pred": current_month_sum, "year_pred": fiscal_year_sum}).reindex(models)
    else:
        predicted_df = pd.DataFrame({"month_pred": "--", "year_pred": "--"}, index=models)
    # 5. Get flying hours to compare to predictions
    uics = [unit.uic] + list(unit.subordinate_uics)

    da_1352_qs = DA_1352.objects.filter(
        reporting_uic__in=uics, reporting_month__range=(fiscal_year_start, reporting_period)
    )
    if da_1352_qs:
        da_1352s = list(da_1352_qs.values(*["model_name", "reporting_month", "flying_hours"]))
        da_1352_df = pd.DataFrame.from_records(da_1352s)
        da_1352_df["reporting_month"] = pd.to_datetime(da_1352_df["reporting_month"])
        current_month_df = da_1352_df[
            (da_1352_df["reporting_month"].dt.year == reporting_period.year)
            & (da_1352_df["reporting_month"].dt.month == reporting_period.month)
        ]

        current_month_sum = current_month_df.groupby("model_name")["flying_hours"].sum()
        fiscal_year_sum = da_1352_df.groupby("model_name")["flying_hours"].sum()
        flown_df = pd.DataFrame({"month_flown": current_month_sum, "year_flown": fiscal_year_sum}).reindex(models)
    else:
        flown_df = pd.DataFrame({"month_flown": "--", "year_flown": "--"}, index=models)
    # 6. Merge predictions and flown dataframes
    merged_df = pd.merge(flown_df, predicted_df, left_index=True, right_index=True)

    # 7. Calculate percentages flown, fill na, and reorder columns correctly
    sum_columns = ["month_flown", "month_pred", "year_flown", "year_pred"]
    merged_df = merged_df[sum_columns]
    merged_df.loc["total"] = merged_df.sum()
    try:
        merged_df["month_perc"] = (merged_df["month_flown"] / merged_df["month_pred"]).map("{:.1%}".format)
    except:
        merged_df["month_perc"] = "--"
    try:
        merged_df["year_perc"] = (merged_df["year_flown"] / merged_df["year_pred"]).map("{:.1%}".format)
    except:
        merged_df["year_perc"] = "--"

    for column in sum_columns:
        try:
            merged_df[column] = merged_df[column].map("{:.1f}".format)
        except:
            pass
    merged_df = merged_df.replace(["------------", "nan", "nan%", "inf%"], "--")

    return merged_df.astype(str)
