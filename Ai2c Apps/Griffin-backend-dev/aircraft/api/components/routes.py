from datetime import datetime
from itertools import groupby
from operator import itemgetter
from typing import List, Optional

import pandas as pd
from defusedcsv import csv
from django.db.models import F
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Query, Router
from ninja.pagination import paginate
from ninja.responses import codes_4xx

from aircraft.api.components.schema import (
    AircraftFailureFilters,
    AircraftFailurePredictionOut,
    AircraftList,
    ComponentFailureFilters,
    ComponentFailurePredictionOut,
    FailureCountFilters,
    FailureCountOut,
    LongevityFilter,
    LongevityOut,
    ModelFailurePredictionOut,
    PartListOut,
    ShinyFailurePredictionsOut,
    ShortLifeOut,
    SurvivalPredictionsOut,
)
from aircraft.models import Aircraft
from aircraft.models import LCF_341_01_LifeLimit as LifeLimit
from aircraft.models import PartLongevity, ShortLife, SurvivalPredictions
from aircraft.utils import calculate_aggregate_failure, calculate_failure_predictions
from auto_dsr.models import Unit

component_router = Router()

HORIZON_STDERR_VALUES = [
    "horizon_5",
    "horizon_10",
    "horizon_15",
    "horizon_20",
    "horizon_25",
    "horizon_30",
    "horizon_35",
    "horizon_40",
    "horizon_45",
    "horizon_50",
    "horizon_55",
    "horizon_60",
    "horizon_65",
    "horizon_70",
    "horizon_75",
    "horizon_80",
    "horizon_85",
    "horizon_90",
    "horizon_95",
    "horizon_100",
    "std_err_5",
    "std_err_10",
    "std_err_15",
    "std_err_20",
    "std_err_25",
    "std_err_30",
    "std_err_35",
    "std_err_40",
    "std_err_45",
    "std_err_50",
    "std_err_55",
    "std_err_60",
    "std_err_65",
    "std_err_70",
    "std_err_75",
    "std_err_80",
    "std_err_85",
    "std_err_90",
    "std_err_95",
    "std_err_100",
]


######## COMPONENT SHORT LIFE RECORDS ########
@component_router.get("/short-life", response=List[ShortLifeOut], summary="Unit Aircraft Component Short Life List")
@paginate
def list_short_life(request: HttpRequest, uic: str, include_na: bool = False):
    """
    Return a list of all component short life records for unit aircraft

    """
    if include_na:
        return ShortLife.objects.filter(aircraft__uic=uic).order_by(F("flying_hours_remaining").asc(nulls_last=True))
    return ShortLife.objects.filter(aircraft__uic=uic, tracker_display_name__isnull=False).order_by(
        F("flying_hours_remaining").asc(nulls_last=True)
    )


@component_router.get(
    "/full-short-life",
    response=List[ShortLifeOut],
    summary="Full (No pagination) Unit Aircraft Component Short Life List",
)
def list_full_short_life(request: HttpRequest, uic: str, include_na: bool = False):
    """
    Return a list of all component short life records for unit aircraft

    """
    if include_na:
        return ShortLife.objects.filter(aircraft__uic=uic)
    return ShortLife.objects.filter(aircraft__uic=uic, tracker_display_name__isnull=False)


######## COMPONENT SURVIVAL PREDICTION RECORDS ########
@component_router.get(
    "/surv-preds", response=List[SurvivalPredictionsOut], summary="Aircraft Component Survival Predictions List"
)
def list_surv_preds(request: HttpRequest, uic: str = None, aircraft_serial: str = None):
    """
    Return a list of all component survival predictions for unit aircraft

    """
    if aircraft_serial:
        aircraft = get_object_or_404(Aircraft, serial=aircraft_serial)
        return SurvivalPredictions.objects.filter(aircraft=aircraft)
    elif uic:
        return SurvivalPredictions.objects.filter(aircraft__uic=uic)
    else:
        return SurvivalPredictions.objects.all()


@component_router.get(
    "/failure-preds",
    response=List[ShinyFailurePredictionsOut],
    summary="List of Potential Aircraft Component Failures Shiny",
)
def list_failure_preds(request: HttpRequest, horizon: int, filter: AircraftList = Query(...)):
    survival_columns = [
        "aircraft",
        "aircraft__model",
        "work_unit_code",
        "nomenclature",
        "part_number",
        f"horizon_{horizon}",
    ]
    aircraft_qs = SurvivalPredictions.objects.filter(aircraft__serial__in=filter.aircraft).values(*survival_columns)
    failure_predictions = calculate_failure_predictions(aircraft_qs, horizon)
    serialized_data = [
        ShinyFailurePredictionsOut(
            model=row[0],
            wuc=row[1],
            part_number=row[2],
            nomenclature=row[3],
            num_failure=row[4],
            most_likely=row[5],
            future_fh=row[6],
        )
        for row in failure_predictions
    ]
    return serialized_data


@component_router.get(
    "/component-risk",
    response=List[ComponentFailurePredictionOut],
    summary="List of Potential Aircraft Component Failures",
)
def component_risk_predictions(request: HttpRequest, filters: ComponentFailureFilters = Query(...)):
    """
    Lists the aggregate risk of component failure by part number within a unit


    @param uic: Unit Identification Code. This is ignored if serial_number is passed.
    @param variant: Should the Top or Bottom 10 be returned based on hour 100.  Default is top.
        This is ignored if part numbers are passed.
    @param part_numbers: Optional.  List of part numbers.  If passed, variant is ignored.
    @param serial_number: Optional. A specific serial number to return components within. If passed, uic is ignored.
    @param other_uics: List of other UICs to filter results on.
    @return: List of all aircraft by serial number for UIC.
    [
        {
            "part_number": "1234",
            "nomenclature": "ABC",
            "failure_detail": { "failure_prob_5": 0, "failure_upper_5": 0, "failure_lower_5": 0 ... }
        },
        {
            "part_number": "5678",
            "nomenclature": "DEF",
            "failure_detail": { "failure_prob_5": 0, "failure_upper_5": 0, "failure_lower_5": 0 ... }
        }
    ]
    """
    return_list = []
    dj_filters = {}

    if len(filters.serial_numbers) > 0:
        dj_filters["aircraft__serial__in"] = filters.serial_numbers
    elif len(filters.other_uics) > 0:
        dj_filters["aircraft__uic__in"] = filters.other_uics
    else:
        dj_filters["aircraft__uic"] = filters.uic

    if len(filters.part_numbers) > 0:
        dj_filters["part_number__in"] = filters.part_numbers

    part_predictions = (
        SurvivalPredictions.objects.prefetch_related("aircraft")
        .filter(**dj_filters)
        .values("part_number", "nomenclature", *HORIZON_STDERR_VALUES)
    )

    predictions = calculate_aggregate_failure(part_predictions, "part_number")

    for part in part_predictions.values("part_number", "nomenclature").distinct():
        return_list.append(
            {
                "part_number": part["part_number"],
                "nomenclature": part["nomenclature"],
                "failure_detail": predictions.loc[part["part_number"]].to_dict(),
            }
        )

    if len(filters.part_numbers) > 0:
        # If part numbers were requested, return the full list
        pass
    elif filters.variant == "bottom":
        # Take the last 10 items of the sorted list
        return_list = sorted(
            return_list, key=lambda item: itemgetter("failure_prob_100")(item["failure_detail"]), reverse=True
        )[-10:]
    else:
        # Take the first 10 items of the sorted list
        return_list = sorted(
            return_list, key=lambda item: itemgetter("failure_prob_100")(item["failure_detail"]), reverse=True
        )[:10]
    return return_list


######## COMPONENT PART NUMBERS ########
@component_router.get(
    "/part-list",
    response=List[PartListOut],
    summary="Get a list of component parts.",
)
def list_parts(request: HttpRequest, uic: str):
    """
    Return a list of all component parts by UIC and a list of their associated model.

    """
    parts = (
        ShortLife.objects.filter(aircraft__uic=uic)
        .values("part_number", "aircraft__airframe__model")
        .order_by("part_number")
    )
    return [
        {"part_number": part, "models": sorted(set(model["aircraft__airframe__model"] for model in models))}
        for part, models in groupby(parts, itemgetter("part_number"))
    ]


######## MODEL RISK PREDICTIONS ########
@component_router.get(
    "/model-risk",
    response=List[ModelFailurePredictionOut],
    summary="Get a list of model risk predictions.",
)
def model_risk_predictions(request: HttpRequest, uic: str, part_number: str):
    """
    Return a list of all component parts by UIC.
    [
        {
            "model_name": "modela",
            "failure_detail": { "failure_prob_5": 0, "failure_upper_5": 0, "failure_lower_5": 0 ... }
        },
        {
            "model_name": "modelb"
            "failure_detail": { "failure_prob_5": 0, "failure_upper_5": 0, "failure_lower_5": 0 ... }
        }
    ]

    """
    return_list = []
    aircraft_models = SurvivalPredictions.objects.filter(part_number=part_number, aircraft__uic=uic).values(
        "aircraft__airframe__model", *HORIZON_STDERR_VALUES
    )
    predictions = calculate_aggregate_failure(aircraft_models, "aircraft__airframe__model")
    # Process each aircraft model on its own.
    for distinct_model in aircraft_models.values_list("aircraft__airframe__model", flat=True).distinct():
        # Calculate the failure for a single aircraft model
        return_list.append(
            {
                "model_name": distinct_model,
                "failure_detail": predictions.loc[distinct_model].to_dict(),
            }
        )
    return return_list


######## AIRCRAFT RISK PREDICTIONS ########
@component_router.get(
    "/aircraft-risk",
    response=List[AircraftFailurePredictionOut],
    summary="Get a list of aircraft risk predictions.",
)
def aircraft_risk_predictions(request: HttpRequest, filters: AircraftFailureFilters = Query(...)):
    """
    @param uic: Unit ID Code
    @param variant: Should the Top or Bottom 10 be returned based on hour 100.  Default is top.
        This is ignored if serial numbers are passed.
    @param serial_numbers: Optional.  List of aircraft serial numbers.  If passed variant is ignored.
    @param part_numbers: Optional. List of component part numbers.
    @param other_uics: List of other UICs to filter results on.
    @return: List of all aircraft by serial number for UIC.
    [
        {
            "serial_number": "1234",
            "failure_detail": { "failure_prob_5": 0, "failure_upper_5": 0, "failure_lower_5": 0 ... }
        },
        {
            "serial_number": "5678"
            "failure_detail": { "failure_prob_5": 0, "failure_upper_5": 0, "failure_lower_5": 0 ... }
        }
    ]

    """
    return_list = []
    if len(filters.other_uics) > 0:
        dj_filters = {"aircraft__uic__in": filters.other_uics}
    else:
        dj_filters = {"aircraft__uic": filters.uic}

    if len(filters.serial_numbers) > 0:
        dj_filters["aircraft__serial__in"] = filters.serial_numbers

    if len(filters.part_numbers) > 0:
        dj_filters["part_number__in"] = filters.part_numbers

    aircraft_models = SurvivalPredictions.objects.filter(**dj_filters).values(
        "aircraft__serial", *HORIZON_STDERR_VALUES
    )

    predictions = calculate_aggregate_failure(aircraft_models, "aircraft__serial")

    # Process each aircraft model on its own.
    for distinct_serial in aircraft_models.values_list("aircraft__serial", flat=True).distinct():
        # Calculate the failure for a single aircraft model
        return_list.append(
            {
                "serial_number": distinct_serial,
                "failure_detail": predictions.loc[distinct_serial].to_dict(),
            }
        )

    if len(filters.serial_numbers) > 0:
        # If serial numbers were requested, return the full list
        pass
    elif filters.variant == "bottom":
        # Take the last 10 items of the sorted list
        return_list = sorted(
            return_list, key=lambda item: itemgetter("failure_prob_100")(item["failure_detail"]), reverse=True
        )[-10:]
    else:
        # Take the first 10 items of the sorted list
        return_list = sorted(
            return_list, key=lambda item: itemgetter("failure_prob_100")(item["failure_detail"]), reverse=True
        )[:10]
    return return_list


######## AIRCRAFT RISK PREDICTIONS ########
@component_router.get(
    "/failure-count",
    response={200: List[FailureCountOut], codes_4xx: dict},
    summary="Return a list of parts where failure rate is at or above value passed for hour passed.",
)
def failure_count(request: HttpRequest, filters: FailureCountFilters = Query(...)):
    """
    Returns a list of part numbers, part name, aircraft serial, aircraft model, and failure %

    @param uic: Unit ID Code
    @param hour: Hour to check failure percentage.  Should be in increments of 5.
    @param failure_percentage: Percentage of failure threshold.
    @param other_uics: List of other UICs to filter results on.
    @return List of parts at or above failure percentage.
    """
    if len(filters.other_uics) > 0:
        dj_filters = {"aircraft__uic__in": filters.other_uics}
    else:
        dj_filters = {"aircraft__uic": filters.uic}

    if filters.hour % 5 != 0 or filters.hour == 0 or filters.hour > 100:
        return 400, {"message": "Invalid hour.  Hour must be divisible by 5 and between 5 and 100"}
    elif filters.failure_percentage > 1 or filters.failure_percentage < 0:
        return 400, {"message": "Invalid percentage.  Failure percentage must be between 0 and 1"}
    return (
        SurvivalPredictions.objects.filter(**dj_filters)
        .annotate(
            model=F("aircraft__airframe__model"),
            serial=F("aircraft__serial"),
            failure_chance=(1 - F(f"horizon_{filters.hour}")),
        )
        .filter(failure_chance__gte=filters.failure_percentage)
        .values("part_number", "nomenclature", "serial", "model", "failure_chance", "work_unit_code")
    )


######## COMPONENT CHECKLIST EXPORT ########
@component_router.get(
    "/comp-checklist-export",
    summary="Export component checklist as CSV",
)
def comp_checklist_export(
    request: HttpRequest,
    filters: FailureCountFilters = Query(...),
    aircraft_serials: Optional[List[str]] = Query(None),
    aircraft_models: Optional[List[str]] = Query(None),
):
    # Call the existing failure-count endpoint
    failure_counts = failure_count(request, filters=filters)

    # Further filter the data by aircraft serial numbers and models if provided
    if aircraft_serials:
        failure_counts = failure_counts.filter(serial__in=aircraft_serials)
    if aircraft_models:
        failure_counts = failure_counts.filter(model__in=aircraft_models)

    # Create the HttpResponse object with the appropriate CSV header
    current_datetime = datetime.now().strftime("%Y%m%d%H%M%S")
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="component_checklist_{current_datetime}.csv"'

    writer = csv.writer(response)
    header = ["Aircraft serial", "Part number", "Description", f"Failure {filters.hour} hours"]
    # Ignoring semgrep as using the defusedcsv
    writer.writerow(header)  # nosemgrep

    for component in failure_counts:
        row = [
            component["serial"],
            component["part_number"],
            component["nomenclature"],
            f"{int(component['failure_chance'] * 100)}%",
        ]
        writer.writerow(row)  # nosemgrep

    return response


######## PART LONGEVITY EXPORT ########
@component_router.get(
    "/longevity", summary="Longevity information for a part", response={200: LongevityOut, codes_4xx: dict}
)
def longevity(request: HttpRequest, filters: LongevityFilter = Query(...)):
    """
    Returns TBO, Unit Average, and Fleet Average longevity for a part

    @param uic: Unit ID Code
    @param part_number: Part Number to calculate longevity
    @param model: Airframe Model Number (optional)
    @return Dictionary of TBO, Unit Average, and Fleet Average
    """
    units = Unit.objects.get(uic=filters.uic).subordinate_unit_hierarchy(include_self=True)
    ll_filters = {"part_number": filters.part_number, "tracking_type": "Hours"}
    pl_filters = {"part_number": filters.part_number}

    if filters.model:
        ll_filters["model_name"] = filters.model
        pl_filters["aircraft__airframe__model"] = filters.model

    tbo = LifeLimit.objects.filter(tbo__isnull=False, **ll_filters).values_list("tbo", flat=True).distinct()
    maot = LifeLimit.objects.filter(tbo__isnull=True, **ll_filters).values_list("maot", flat=True).distinct()
    comp_type = LifeLimit.objects.filter(**ll_filters).values_list("component_type", flat=True).distinct()

    # Check if part number values (TBO/MAOT) has more than one value. If so error
    if tbo.count() > 1 or maot.count() > 1:
        return 400, {"message": "More than one TBO or MAOT found."}

    longevity = pd.DataFrame(PartLongevity.objects.filter(**pl_filters).values())
    if len(longevity) == 0:
        return 400, {"message": f"No data found for part {filters.part_number} and model {filters.model}"}

    unit_parts = longevity[longevity["uic_id"].isin(units)]
    # Need to calculate over all outcome causal and divide by the sum of the causal = true
    unit_sum = unit_parts["outcome_fh"].sum()
    unit_count = len(unit_parts[unit_parts["outcome_causal"] == True])
    unit_avg = unit_sum / unit_count if unit_count > 0 else 0
    fleet_sum = longevity["outcome_fh"].sum()
    fleet_count = len(longevity[longevity["outcome_causal"] == True])
    fleet_avg = fleet_sum / fleet_count if fleet_count > 0 else 0

    # Need to calculate over all consq and divide by the sum of the consq = condemnation
    unit_replacement_count = len(unit_parts[unit_parts["consq"] == "condemnation"])
    unit_replacement_average = unit_sum / unit_replacement_count if unit_replacement_count > 0 else 0
    fleet_replacement_count = len(longevity[longevity["consq"] == "condemnation"])
    fleet_replacement_average = fleet_sum / fleet_replacement_count if fleet_replacement_count > 0 else 0

    # TBO pulled from Part Life Limit table, if null, look at MAOT else, use fleet average
    tbo_value = tbo[0] if tbo else maot[0] if maot else fleet_avg  # nosemgrep
    indicator = "tbo" if tbo else "maot" if maot else "fleet"  # nosemgrep

    # Look at component type, if CC, TC, or not found use causal, else consq
    rtn_unit_avg = (
        unit_avg
        if comp_type.count() > 0 and (comp_type[0] == "CC" or comp_type[0] == "TC" or comp_type[0] is None)
        else unit_replacement_average
    )

    rtn_fleet_avg = (
        fleet_avg
        if comp_type.count() > 0 and (comp_type[0] == "CC" or comp_type[0] == "TC" or comp_type[0] is None)
        else fleet_replacement_average
    )

    return {"tbo": tbo_value, "value_type": indicator, "unit_average": rtn_unit_avg, "fleet_average": rtn_fleet_avg}
