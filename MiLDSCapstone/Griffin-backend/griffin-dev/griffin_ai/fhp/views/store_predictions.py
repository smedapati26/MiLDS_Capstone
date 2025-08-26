from django.db import transaction
from django.db.utils import IntegrityError
import logging
import pandas as pd

from auto_dsr.models import Unit
from fhp.models import MonthlyPrediction


def store_prediction(row: pd.Series) -> int:
    """
    Creates MonthlyPrediction objects associated with the FHP FY prediction model

    @param row: (pd.Series) the DataFrame row containing the necessary prediction data
    @returns: (int) the number of prediction records created (should be 1)
    """
    try:  # to get the unit object for the associated uic
        unit = Unit.objects.get(uic=row.uic)
    except Unit.DoesNotExist:
        logging.error("%s does not exist in the database" % row.uic)
        return 0

    try:  # to serialize the predictions
        with transaction.atomic():
            MonthlyPrediction.objects.create(
                unit=unit,
                mds=row.mds,
                reporting_month=row.reporting_month,
                predicted_hours=row.predicted_hours,
                model=row.model,
                prediction_date=row.prediction_date,
            )
    except IntegrityError as e:
        logging.error("Prediction fails integrity checks")
        return 0

    return 1
