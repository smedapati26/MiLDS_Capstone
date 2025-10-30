import math
from typing import List

import pandas as pd


def calculate_failure_predictions(queryset, horizon):
    if len(queryset) == 0:
        return []
    df = pd.DataFrame(list(queryset))
    df["failure_prob"] = 1 - df[f"horizon_{horizon}"]
    df["aircraft_family"] = df["aircraft__model"].str[1:5]
    df = df.sort_values(by="failure_prob", ascending=False)
    # Group and summarize
    summary_df = (
        df.groupby(["aircraft_family", "work_unit_code", "part_number", "nomenclature"])
        .agg(
            fail_forecast=("failure_prob", lambda x: str(round(x.sum()))),  # Sum of failure probabilities
            most_likely=("aircraft", lambda x: x.iloc[0]),  # First aircraft serial
        )
        .reset_index()
    )

    # Sort by fail_forecast descending
    summary_df = summary_df.sort_values(by="fail_forecast", ascending=False)
    summary_df["future_fh"] = str(horizon)

    return summary_df.values.tolist()


def calculate_failure(group: pd.DataFrame) -> pd.Series:
    """Calculates the failure rates for each probability, grouped by relevant feature.

    @param group: pd.DataFrame of horizon and standard errors by hour grouped by feature.
    @return pd.Series of failure probabilities for giving grouping

    The return series of the failure rates and the upper/lower
    range by hour

    {
        "failure_prob_5": 0.0001,
        "failure_upper_5": 0.011,
        "failure_lower_5": 0.00009
    }

    Math Notes (Using hour 5 as an example):
        relative error = (std_err_5 / horizon_5) ^ 2  # This will be for each X_5
        survival = product of all horizon_5
        standard error = survival * sqrt(sum relative error)
        probability of failure = 1 - survival
        upper = 1 - survival - 1.96 * standard error
            If greater than 1, set to 1
        lower = 1 - survival + 1.96 * standard error
            If less than 0, set to 0
    """
    survival = group.filter(like="horizon_").product()
    result = {}

    for hour in range(5, 101, 5):
        horizon_key = f"horizon_{hour}"
        std_err_key = f"std_err_{hour}"

        # Relative error
        group[f"relative_error_{hour}"] = (group[std_err_key] / group[horizon_key]) ** 2

        # Standard error
        std_err = survival[horizon_key] * math.sqrt(group[f"relative_error_{hour}"].sum())

        # Probability of failure
        failure_prob = 1 - survival[horizon_key]

        # Upper and lower bounds
        upper = 1 - survival[horizon_key] - 1.96 * std_err
        lower = 1 - survival[horizon_key] + 1.96 * std_err

        # Store results with bounds
        result[f"failure_prob_{hour}"] = failure_prob
        result[f"failure_upper_{hour}"] = min(max(upper, 0), 1)
        result[f"failure_lower_{hour}"] = min(max(lower, 0), 1)

    return pd.Series(result)


def calculate_aggregate_failure(probabilities: List[dict], key: str) -> pd.DataFrame | None:
    """Calculates the failure rates for all probabilities in a given query.
    Conducts a groupby on the relevant feature before calculating probabilities within
    those groupings

    @param probabilities: List of horizon and standard errors by hour for a probability set.
    @param key: relevant grouping key in the incoming dictionary.  Ex: aircraft__airframe__model
    @return pd.DataFrame of failure probabilities for the given values
    """
    if len(probabilities) == 0:
        return None

    if key not in probabilities[0].keys():
        return None

    probabilities_df = pd.DataFrame(list(probabilities), columns=probabilities[0].keys())
    return probabilities_df.groupby(key, sort=False).apply(calculate_failure)
