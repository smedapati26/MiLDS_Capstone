from personnel.models import Soldier, Unit
from forms.models import DA_7817, EventTasks
from tasks.models import Task

import pandas as pd
from datetime import datetime


def get_soldier_uctl_and_ictl_dataframes(soldier: Soldier):
    # Get Soldier DA7817s
    soldier_7817s = DA_7817.objects.filter(soldier=soldier, event_deleted=False)
    # Get all relevant values for tasks that are ictl approved and the current soldier mos
    task_values = [
        "ictl__mos__mos_code",
        "ictl__ictl_id",
        "ictl__ictl_title",
        "ictl__proponent",
        "ictl__unit",
        "ictl__unit__short_name",
        "ictl__skill_level",
        "ictl__target_audience",
        "ictl__status",
        "task_number",
        "task_title",
        "pdf_url",
        "unit_task_pdf",
        "training_location",
        "frequency",
        "subject_area",
    ]

    all_soldier_mos = [mos["mos"] for mos in soldier.additional_mos.values("mos")]
    if soldier.primary_mos is not None:
        all_soldier_mos.append(soldier.primary_mos.mos)

    tasks_df = pd.DataFrame(
        list(
            Task.objects.filter(ictl__status="Approved", deleted=False, ictl__mos__mos_code__in=all_soldier_mos).values(
                *task_values
            )
        )
    )

    # Create an empty dataframe with the columns defined as the expected return values to allow for data logic.
    if tasks_df.empty:
        tasks_df = pd.DataFrame(columns=task_values)

    # Get the completed tasks from a soldier's event record
    soldier_completed_tasks = EventTasks.objects.filter(event__in=soldier_7817s)

    task_completion_info = ["task", "event__date", "event__event_type__type"]

    # Convert to pandas df for filtering to most recent task completion
    task_completion_df = pd.DataFrame(list(soldier_completed_tasks.values(*task_completion_info)))

    # Soldier has not completed any tasks, create an empty dataframe with expected columns
    if task_completion_df.empty:
        recent_task_df = pd.DataFrame(columns=["task_number", "most_recent_date", "training_or_eval"])

    # Calcualte the most_recent_date for the events if the soldier has completed tasks
    else:
        task_completion_df["event__date"] = pd.to_datetime(task_completion_df["event__date"])
        recent_task_df = task_completion_df.loc[task_completion_df.groupby("task")["event__date"].idxmax()]
        recent_task_df["event__date"] = recent_task_df["event__date"].astype(str)

        recent_task_df.columns = ["task_number", "most_recent_date", "training_or_eval"]

    # Merge the tasks and recent tasks based on task_number with a left join.
    merged_df = pd.merge(tasks_df, recent_task_df, on="task_number", how="left")

    if not merged_df.empty:
        # Get the Grouping columns for everything but mos
        merged_df = merged_df.groupby(merged_df.columns.difference(["ictl__mos__mos_code"]).tolist(), dropna=False)

        # Get the Unique MOS code for each row
        merged_df = merged_df.agg(MOS=("ictl__mos__mos_code", lambda x: ", ".join(map(str, x.unique())))).reset_index()

        # Rename the merged df to use MOS for the column name
        merged_df.rename(columns={"ictl__mos__mos_code": "MOS"}, inplace=True)

        # Set a ictl_unit_name column equal to the short name of the ictl__unit if it exists, otherwise None
        merged_df["ictl_unit_name"] = None
        merged_df["ictl_unit_name"] = merged_df.apply(
            lambda x: (
                Unit.objects.get(uic=x["ictl__unit"]).short_name
                if Unit.objects.filter(uic=x["ictl__unit"]).exists()
                else None
            ),
            axis=1,
        )

        # Get the first non-NA of ictl_unit_name and the ictl__proponent
        merged_df = merged_df.assign(
            ictl_proponent=merged_df["ictl_unit_name"].combine_first(merged_df["ictl__proponent"])
        )

        # Set the next due based on if the frequency is annual or semi-annual
        today = pd.to_datetime(datetime.now().date())
        merged_df["next_due"] = None
        merged_df.loc[merged_df["frequency"] == "Annually", "next_due"] = (
            365 - (today - pd.to_datetime(merged_df["most_recent_date"])).dt.days
        )
        merged_df.loc[merged_df["frequency"] == "Semi-annually", "next_due"] = (
            180 - (today - pd.to_datetime(merged_df["most_recent_date"])).dt.days
        )

        # Grab and rename only the required columns for this data
        full_ictl_df = merged_df[
            [
                "ictl__ictl_title",
                "task_number",
                "task_title",
                "frequency",
                "subject_area",
                "ictl_proponent",
                "ictl__unit__short_name",
                "ictl__skill_level",
                "MOS",
                "most_recent_date",
                "next_due",
                "ictl__unit",
                "pdf_url",
            ]
        ]

        full_ictl_df = full_ictl_df.rename(
            columns={
                "task_number": "Task Number",
                "task_title": "Task Title",
                "frequency": "Frequency",
                "subject_area": "Subject Area",
                "ictl_proponent": "ICTL Proponent",
                "ictl__skill_level": "Skill Level",
                "most_recent_date": "Last Completed",
                "next_due": "Next Due (days)",
                "pdf_url": "Document Link",
            }
        )

        # Sort the ICTLs by Skill Level and the ICTL Title
        full_ictl_df = full_ictl_df.sort_values(by=["Skill Level", "ictl__ictl_title"])

        # Get USAACE ICTL from full ictl where ICTL Proponent is USAACE
        usaace_ictl_df = full_ictl_df[full_ictl_df["ICTL Proponent"] == "USAACE"]

        # Get Unit UCTL based on current soldier unit uic and parent unit uics
        uctl_units = [soldier.unit.uic] + soldier.unit.parent_uics
        unit_uctl_df = full_ictl_df[full_ictl_df["ictl__unit"].isin(uctl_units)]

    else:
        usaace_ictl_df = []
        unit_uctl_df = []

    return usaace_ictl_df, unit_uctl_df
