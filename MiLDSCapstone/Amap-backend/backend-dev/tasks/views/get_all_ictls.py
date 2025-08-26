from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from tasks.models import Ictl

import pandas as pd
import json
from utils.logging import log_api_call


@require_GET
@log_api_call
def get_all_ictls(request: HttpRequest):
    """
    Get all ICTLs
    """
    ictls = Ictl.objects.filter(status="Approved")

    ictl_values = [
        "ictl_id",
        "ictl_title",
        "date_published",
        "proponent",
        "unit__uic",
        "status",
        "skill_level",
        "target_audience",
        "mosictls__mos__mos_code",
    ]

    # Create DataFrame
    ictl_df = pd.DataFrame(list(ictls.values(*ictl_values)))

    # Replace null values in "unit__uic" column with a placeholder for grouping
    ictl_df.fillna({"unit__uic": "None"}, inplace=True)

    # Collapse rows and aggregate "mos" into a list of unique values
    collapsed_df = (
        ictl_df.groupby(
            [
                "ictl_id",
                "ictl_title",
                "date_published",
                "proponent",
                "unit__uic",
                "status",
                "skill_level",
                "target_audience",
            ]
        )["mosictls__mos__mos_code"]
        .agg(lambda x: list(set(x)))
        .reset_index()
    )

    # Convert "None" back to actual null values
    collapsed_df.loc[collapsed_df["unit__uic"] == "None", "unit__uic"] = pd.NA
    collapsed_df.columns = [
        "ictl_id",
        "ictl_title",
        "date_published",
        "proponent",
        "unit_id",
        "status",
        "skill_level",
        "target_audience",
        "mos_list",
    ]

    return JsonResponse({"ictls": json.loads(collapsed_df.to_json(orient="records"))})
