from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from tasks.models import Ictl

import pandas as pd
import json
from utils.logging import log_api_call


@require_GET
@log_api_call
def shiny_get_uctl_info(request: HttpRequest, uctl_id: int):
    """
    Get a specific UCTL and return it's information
    """
    uctl = Ictl.objects.filter(ictl_id=uctl_id)

    uctl_values = [
        "ictl_title",
        "unit__uic",
        "skill_level",
        "mosictls__mos__mos_code",
        "target_audience",
    ]

    # Create DataFrame
    uctl_df = pd.DataFrame(list(uctl.values(*uctl_values)))

    # Replace null values in "unit__uic" column with a placeholder for grouping
    uctl_df.fillna({"unit__uic": "None"}, inplace=True)

    # Collapse rows and aggregate "mos" into a list of unique values
    collapsed_df = (
        uctl_df.groupby(["ictl_title", "unit__uic", "skill_level", "target_audience"])["mosictls__mos__mos_code"]
        .agg(lambda x: list(set(x)))
        .reset_index()
    )

    # Convert "None" back to actual null values
    collapsed_df.loc[collapsed_df["unit__uic"] == "None", "unit__uic"] = pd.NA
    collapsed_df.columns = ["ictl_title", "uic", "skill_level", "target_audience", "mos"]

    return JsonResponse({"uctl_info": json.loads(collapsed_df.to_json(orient="records"))})
