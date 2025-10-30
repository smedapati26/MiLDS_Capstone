"""
Data Ingestion Script for unit provided FHP projections
"""

from datetime import date

import pandas as pd

from auto_dsr.models import Unit
from fhp.models import RawAnnualProjection, RawCostFactor, RawMonthlyForecast

SOURCE = "USARPAC"


def create_raw_monthly_forecasts(unit: Unit, unit_type: str | None, row: pd.Series) -> None:
    """
    Creates 12 monthly forecast records for the provided unit
    """
    month_to_reporting_period = {
        "oct": date(row.fy - 1, 10, 15),
        "nov": date(row.fy - 1, 11, 15),
        "dec": date(row.fy - 1, 12, 15),
        "jan": date(row.fy, 1, 15),
        "feb": date(row.fy, 2, 15),
        "mar": date(row.fy, 3, 15),
        "apr": date(row.fy, 4, 15),
        "may": date(row.fy, 5, 15),
        "jun": date(row.fy, 6, 15),
        "jul": date(row.fy, 7, 15),
        "aug": date(row.fy, 8, 15),
        "sep": date(row.fy, 9, 15),
    }

    for m in month_to_reporting_period.keys():
        forecast = row[m]

        try:
            RawMonthlyForecast.objects.create(
                unit=unit,
                unit_type=unit_type,
                model=row.mds,
                forecasted_hours=forecast,
                reporting_month=month_to_reporting_period[m],
                source=SOURCE,
            )
        except Exception as e:
            print(e)


def ingest_raw_fhp_data(row: pd.Series) -> None:
    """
    Ingests an FHP projection dataset in a csv file with columns:
    uic,type,mds,cost_factor,unit_requested_hours,oct,nov,dec,jan,feb,mar,apr,may,jun,jul,aug,sep
    """
    try:
        unit = Unit.objects.get(uic=row.uic)
    except Unit.DoesNotExist:
        print("{} is not in the units database... yet".format(row.uic))
        return

    if pd.isna(row.type):
        unit_type = None
    else:
        unit_type = row.type
    # Create annual record
    try:
        RawAnnualProjection.objects.create(
            unit=unit,
            unit_type=unit_type,
            model=row.mds,
            requested_hours=row.unit_requested_hours,
            fiscal_year=row.fy,
            source=SOURCE,
        )
    except Exception as e:
        print(e)

    # Create Monthly forecast records
    create_raw_monthly_forecasts(unit=unit, unit_type=unit_type, row=row)

    # Create cost factor record
    try:
        RawCostFactor.objects.create(
            unit=unit,
            unit_type=unit_type,
            model=row.mds,
            cost_factor=row.cost_factor,
            fiscal_year=row.fy,
            source=SOURCE,
        )
    except Exception as e:
        print(e)


fhp_csv_dtypes = {
    "uic": "str",
    "type": "str",
    "mds": "str",
    "cost_factor": "float",
    "unit_requested_hours": "int",
    "oct": "Int64",
    "nov": "Int64",
    "dec": "Int64",
    "jan": "Int64",
    "feb": "Int64",
    "mar": "Int64",
    "apr": "Int64",
    "may": "Int64",
    "jun": "Int64",
    "jul": "Int64",
    "aug": "Int64",
    "sep": "Int64",
    "fy": "int",
}
fhp_df = pd.read_csv("scripts/fhp/data/usarpac.csv", dtype=fhp_csv_dtypes)

fhp_df.apply(lambda row: ingest_raw_fhp_data(row), axis=1)
