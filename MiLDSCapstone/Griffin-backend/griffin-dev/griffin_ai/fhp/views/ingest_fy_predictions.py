from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from django.views.decorators.http import require_POST
import pandas as pd

from fhp.views.store_predictions import store_prediction
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_PREDICTIONS_FILE_MISSING,
    HTTP_ERROR_MESSAGE_PREDICTIONS_READ_FAILED,
    HTTP_ERROR_MESSAGE_PREDICTIONS_DATE_PARSE_FAILED,
)


@require_POST
def ingest_fy_predictions(request: HttpRequest):
    """
    Ingests a csv of Fiscal Year predictions and creates the appropriate prediction records
    in the database. The CSV file must have the following columns:
        unit: (str) the uic of the unit the predicted hours are associated with (must exist in the database)
        mds: (str) the airframe the predicted hours are associated with
        reporting_month: (date) ISO Formatted last day of the reporting period (YYYY-MM-DD)
        predicted_hours: (float) The predicted flying hours value for the given period
        model: (str) the machine learning model used to generate the prediction
        prediction_date: (date) the date the predictions were generated on

    @param request: (django.http.HttpRequest) the request object
    """
    try:  # to get the predictions file from the request
        f = request.FILES["predictions"]
    except Exception as e:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_PREDICTIONS_FILE_MISSING)

    preds_dtypes = {
        "unit": "str",
        "mds": "str",
        "reporting_month": "str",
        "predicted_hours": "float",
        "model": "str",
        "prediction_date": "str",
    }
    try:  # to read the predictions csv file
        preds_df = pd.read_csv(f, dtype=preds_dtypes)
    except Exception as e:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_PREDICTIONS_READ_FAILED.format(e))

    try:  # to convert date values to the pandas datatype
        date_format = "%Y-%m-%d"
        preds_df.reporting_month = pd.to_datetime(preds_df.reporting_month, format=date_format).dt.date
        preds_df.prediction_date = pd.to_datetime(preds_df.prediction_date, format=date_format).dt.date
    except Exception as e:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_PREDICTIONS_DATE_PARSE_FAILED.format(e))

    preds_df["created_record"] = preds_df.apply(lambda row: store_prediction(row), axis=1)
    status_code = 200 if preds_df.shape[0] == sum(preds_df.created_record) else 205

    return HttpResponse(
        "Created %d prediction records from %d prediction rows" % (sum(preds_df.created_record), preds_df.shape[0]),
        status=status_code,
    )
