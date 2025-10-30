import json

import pandas as pd
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from personnel.models import Unit
from tasks.models import Ictl, IctlTasks
from utils.http.constants import HTTP_404_ICTL_DOES_NOT_EXIST


@require_GET
def get_uctl_tasks(request: HttpRequest, uctl_id: int):
    """
    Get unit UCTL Tasks

    For Tasks originally published by USAACE, return the status of their original ICTL
    to allow units to see tasks in their UCTL that have been superceded
    """
    try:  # to get the unit requested
        uctl = Ictl.objects.get(ictl_id=uctl_id)
    except Ictl.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_ICTL_DOES_NOT_EXIST)

    # Get UCTL tasks
    uctl_tasks = IctlTasks.objects.filter(ictl=uctl, task__deleted=False)

    uctl_task_values = [
        "task__task_number",
        "task__task_title",
        "task__pdf_url",
        "task__unit_task_pdf",
        "task__frequency",
        "ictl__unit__short_name",
        "ictl__status",
    ]

    uctl_df = pd.DataFrame(list(uctl_tasks.values(*uctl_task_values)))

    # Get USAACE ICTL Tasks
    usaace_ictl_tasks = IctlTasks.objects.filter(ictl__proponent="USAACE")

    usaace_ictl_values = ["task__task_number", "ictl__status"]

    usaace_df = pd.DataFrame(list(usaace_ictl_tasks.values(*usaace_ictl_values)))
    usaace_df.columns = ["task__task_number", "originating_status"]

    if uctl_df.empty:
        column_names = ["task__task_number", "task__task_title", "task__pdf_url", "task__frequency", "overall_status"]
        merged_df = pd.DataFrame(columns=column_names)
    else:
        # Merge UCTL Tasks with USAACE Tasks on task number to get the originating ICTLs status
        merged_df = pd.merge(uctl_df, usaace_df, on="task__task_number", how="left")
        merged_df["overall_status"] = merged_df["originating_status"].fillna(merged_df["ictl__status"])
        merged_df = merged_df.sort_values(by="overall_status", ascending=True)
        # Drop duplicates based on specified columns, keeping the first occurrence (which will be the "Approved" one if present)
        merged_df = merged_df.drop_duplicates(
            subset=["task__task_number", "task__task_title", "task__pdf_url", "task__frequency"], keep="first"
        )

    task_df = merged_df[["task__task_number", "task__task_title", "task__pdf_url", "task__frequency", "overall_status"]]
    task_df.columns = ["Task Number", "Task Title", "pdf_url", "Frequency", "Status"]

    return JsonResponse({"uctl_tasks": json.loads(task_df.to_json(orient="records"))})
