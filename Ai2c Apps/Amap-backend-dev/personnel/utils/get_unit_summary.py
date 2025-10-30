import json

import pandas as pd
from django.db.models import Q

from personnel.models import Soldier
from units.models import Unit

from .get_soldier_mos_ml_dict import get_soldier_mos_ml
from .single_soldier_availability import get_prevailing_user_status


def get_unit_summary(unit: Unit, expand: str, summarize_by: str):
    """
    Returns a summary breakdown of AMTP status per Unit and MOS (by = "Both"),
    just by Unit (by = "Unit") or just by MOS (by = "MOS")

    If expand = True, break down summary to each individual UIC in the selected unit
    If expand = False, break down just the selected unit's direct children
    """

    # Get soldiers from provided unit and extract needed information for summary view
    soldiers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics]).exclude(
        Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True) | Q(is_maintainer=False)
    )
    soldier_info = [
        "user_id",
        "unit__uic",
        "unit__echelon",
        "unit__parent_uics",
        "primary_mos__mos",
    ]

    users_status = {soldier.user_id: get_prevailing_user_status(soldier, numeric=True) for soldier in soldiers}
    soldiers_ml = {soldier.user_id: get_soldier_mos_ml(soldier) for soldier in soldiers}

    soldier_df = pd.DataFrame(list(soldiers.values(*soldier_info)))

    soldier_df["Available"] = soldier_df["user_id"].map(users_status)
    soldier_df["maintenance_level"] = soldier_df["user_id"].map(soldiers_ml)

    # Fill missing values for "maintenance_level" with "Missing ML"
    soldier_df.fillna({"maintenance_level": "Missing Packet"}, inplace=True)

    # Set default grouping to unit_uic to expand all children
    soldier_df["grouping_unit"] = soldier_df["unit__uic"]

    # If Summarizing by Unit
    if summarize_by != "MOS":
        # If not expanded - set grouping unit to all grandchildren as child unit uic
        if expand == "False":
            child_uics = unit.child_uics
            for child in child_uics:
                soldier_df.loc[soldier_df["unit__parent_uics"].str.contains(child, regex=False), "grouping_unit"] = (
                    child
                )
    else:
        soldier_df["grouping_unit"] = soldier_df["primary_mos__mos"]

    # Calculate totals for each direct child (not expanded) or each uic across ML0-ML4
    df_totals = (
        soldier_df.groupby("grouping_unit")["maintenance_level"].value_counts().unstack(fill_value=0).reset_index()
    )

    df_totals = df_totals.reindex(
        columns=["grouping_unit", "primary_mos__mos", "ML0", "ML1", "ML2", "ML3", "ML4", "Missing Packet"], fill_value=0
    ).reset_index()

    df_totals["Total"] = df_totals[["ML0", "ML1", "ML2", "ML3", "ML4", "Missing Packet"]].sum(axis=1)

    availability_total = soldier_df.groupby("grouping_unit")[["Available"]].agg("sum").reset_index()

    # Join the availability_total dataframe with df_totals on the grouping_unit column
    df_totals = df_totals.merge(availability_total)

    # return JsonResponse({"summary": json.loads(df_totals.to_json(orient="records"))})

    # Create a list to hold final results
    result = []

    for _, unit_group in soldier_df.groupby("grouping_unit"):
        # Get Current Grouping Unit (If grouping by unit)
        if summarize_by != "MOS":
            current_unit = Unit.objects.get(uic=unit_group["grouping_unit"].iloc[0])
        else:
            current_unit = unit
        # Iterate over each mos group within the unit__uic group
        for _, mos_group in unit_group.groupby("primary_mos__mos"):
            # Pivot the mos_group DataFrame to get the desired format
            mos_group_pivot = pd.pivot_table(
                mos_group, index="primary_mos__mos", columns="maintenance_level", aggfunc="size", fill_value=0
            )
            mos_group_pivot = mos_group_pivot.reindex(
                columns=["ML0", "ML1", "ML2", "ML3", "ML4", "Missing Packet"], fill_value=0
            ).reset_index()

            # Get unit short name
            mos_group_pivot["Unit"] = current_unit.short_name

            # Get availability total
            availability_total = mos_group.groupby("grouping_unit")[["Available"]].agg("sum").reset_index()

            if summarize_by == "MOS":
                mos_group_pivot["Total"] = mos_group_pivot[["ML0", "ML1", "ML2", "ML3", "ML4", "Missing Packet"]].sum(
                    axis=1
                )
                mos_group_pivot = mos_group_pivot.merge(
                    availability_total, left_on=["primary_mos__mos"], right_on=["grouping_unit"]
                )
            if summarize_by != "Unit":
                # Append breakdown for each MOS
                result.extend(mos_group_pivot.to_dict(orient="records"))

        if summarize_by != "MOS":
            # Calculate total for the current grouping unit
            total_row = df_totals[df_totals["grouping_unit"] == unit_group["grouping_unit"].iloc[0]].to_dict(
                orient="records"
            )[0]
            total_row["Unit"] = current_unit.short_name + " Total"
            total_row["primary_mos__mos"] = None
            result.append(total_row)

    # Calculate total breakdown for all UICs
    total_breakdown = df_totals.sum(numeric_only=True)
    total_row_all_uics = {"primary_mos__mos": None, "Unit": unit.short_name + " Grand Total"}
    total_row_all_uics.update(total_breakdown)
    result.append(total_row_all_uics)

    # Concatenate the result into a DataFrame
    df_result = pd.DataFrame(result)

    # Reorder columns
    df_result = df_result[
        ["Unit", "primary_mos__mos", "ML0", "ML1", "ML2", "ML3", "ML4", "Missing Packet", "Total", "Available"]
    ]

    df_result.columns = [
        "Unit",
        "Primary MOS",
        "ML0",
        "ML1",
        "ML2",
        "ML3",
        "ML4",
        "Missing Packet",
        "Total",
        "Available",
    ]

    return json.loads(df_result.to_json(orient="records"))
