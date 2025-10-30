import json

import defusedxml.ElementTree as et
import pandas as pd
from django.http import HttpRequest, HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.views.decorators.http import require_POST

from personnel.models import Soldier
from utils.http.constants import HTTP_400_XML_MISSING_REQUIRED_FIELDS, HTTP_404_SOLDIER_DOES_NOT_EXIST

# Ingest XML document from 7817 via shiny, load it into soldiers records


@require_POST
def shiny_ingest_7817_xml(request: HttpRequest, dod_id: str) -> JsonResponse:
    """
    @param request : (django.http.HttpRequest) the request object
    @param dod_id : (str) the DOD ID number for the soldier to ingest records for

    @returns (django.http.JsonResponse) a Json formatted message containing parsed Soldier
             information and training records
    """
    root = et.fromstring(request.body)

    # Get soldier object
    try:
        soldier = Soldier.objects.get(user_id=dod_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    # Get Rank Progression Data
    if root.find(".//Rank1") is not None:
        rank1 = root.find(".//Rank1").text
    else:
        # Only return error on first missing field of incorrectly formatted xml
        return HttpResponseServerError(HTTP_400_XML_MISSING_REQUIRED_FIELDS)
    if root.find(".//Rank2") is not None:
        rank2 = root.find(".//Rank2").text
    if root.find(".//Rank3") is not None:
        rank3 = root.find(".//Rank3").text
    if root.find(".//Rank4") is not None:
        rank4 = root.find(".//Rank4").text
    if root.find(".//Rank5") is not None:
        rank5 = root.find(".//Rank5").text
    if root.find(".//Rank6") is not None:
        rank6 = root.find(".//Rank6").text

    ranks = [rank1, rank2, rank3, rank4, rank5, rank6]

    # Create empty list to fill with dates
    dates = [None] * 6

    for i in range(1, 7):
        if root.find(".//Date_Rank" + str(i)).text is not None:
            rank_date = root.find(".//Date_Rank" + str(i)).text
            rank = ranks[i - 1].upper()
            if rank == "PV2":
                dates[i - 1] = rank_date
            elif rank == "PFC":
                dates[i - 1] = rank_date
            elif rank == "SPC":
                dates[i - 1] = rank_date
            elif rank == "SGT":
                dates[i - 1] = rank_date
            elif rank == "SSG":
                dates[i - 1] = rank_date
            elif rank == "SFC":
                dates[i - 1] = rank_date

    soldier_info = pd.DataFrame([ranks, dates])
    soldier_info.columns = soldier_info.iloc[0]
    soldier_info = soldier_info.iloc[1:]
    soldier_info.dropna(axis=1, inplace=True)

    # Loop through rows of the document - create data table to then return to user
    all_records = []
    go_nogo_map = {"0": "N/A", "1": "GO", "2": "NOGO", "3": "N/A"}
    soldier_ML = ["ML0"]
    for i in range(1, 24):
        # Check that an event exists
        if root.find(".//Date" + str(i)).text is not None:
            event_date = root.find(".//Date" + str(i)).text
            uic = soldier.unit.uic
            event_type = "Other"
            training_type = None
            evaluation_type = None
            award_type = None
            gaining_unit = None
            event_remarks = root.find(".//Event" + str(i)).text
            total_mx_hours = None
            maintenance_level = None
            recorded_by_legacy = root.find(".//Recorded_By" + str(i)).text
            go_nogo = go_nogo_map[root.find(".//group" + str(i)).text]
            soldier_initials = root.find(".//Initials" + str(i)).text
            # Check for any back page additional comments corresponding to the event
            for j in range(1, 24):
                if root.find(".//Date_" + str(j)).text == event_date:
                    event_remarks = event_remarks + " (Additional Remarks) -> " + root.find(".//Remarks_" + str(j)).text

            # Check for evaluations
            eval_strings = ["evaluation", "eval", "evluation", "evalaution"]
            if any(eval in event_remarks.lower() for eval in eval_strings):
                event_type = "Evaluation"
                # CDR eval
                cdr_string = ["commander", "cdr"]
                if any(cdr in event_remarks.lower() for cdr in cdr_string):
                    evaluation_type = "CDR Eval"
                # No Notice
                no_notice = ["no notice", "notice"]
                if any(no in event_remarks.lower() for no in no_notice):
                    evaluation_type = "No Notice"
                else:
                    evaluation_type = "Annual"

            # Check for training
            train_strings = ["training", "train", "trng", "traning", "course"]
            if any(train in event_remarks.lower() for train in train_strings):
                event_type = "Training"
                training_type = "Other"

            # Check for PCS/ETS/TCS
            pcs_strings = ["assigned", "pcs", "ets", "tcs"]
            if any(pcs in event_remarks.lower() for pcs in pcs_strings):
                event_type = "PCS/ETS"

            # Check for Award
            award_strings = ["award", "recieved"]
            if any(award in event_remarks.lower() for award in award_strings):
                event_type = "Award"
                award_type = "Other"

            # Check for ML update
            if "ML" in event_remarks:
                soldier_ML.append("ML" + event_remarks[event_remarks.index("ML") + 2])
            # Set soldier maintenance level to the last set maintenance level
            maintenance_level = soldier_ML[-1]

            total_record = [
                event_date,
                uic,
                event_type,
                training_type,
                evaluation_type,
                award_type,
                gaining_unit,
                event_remarks,
                total_mx_hours,
                maintenance_level,
                recorded_by_legacy,
                go_nogo,
                soldier_initials,
            ]
            # Check if the record is already in A-MAP, diregard if it is
            if event_remarks[:5] != "A-MAP":
                all_records.append(total_record)

    soldier_info["ML"] = soldier_ML[-1]
    soldier_info["DOD_ID"] = soldier.user_id

    da7817_records = pd.DataFrame(all_records)
    da7817_records.columns = [
        "event_date",
        "uic",
        "event_type",
        "training_type",
        "evaluation_type",
        "award_type",
        "gaining_unit",
        "event_remarks",
        "total_mx_hours",
        "maintenance_level",
        "recorded_by_legacy",
        "go_nogo",
        "soldier_initials",
    ]

    return JsonResponse(
        {
            "Soldier_info": json.loads(soldier_info.to_json(orient="records")),
            "Soldier_records": json.loads(da7817_records.to_json(orient="records")),
        }
    )
