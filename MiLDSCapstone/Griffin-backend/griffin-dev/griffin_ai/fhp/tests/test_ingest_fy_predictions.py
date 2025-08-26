from django.test import TestCase, tag
from django.urls import reverse
import logging

from fhp.models import MonthlyPrediction
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_PREDICTIONS_FILE_MISSING,
    HTTP_ERROR_MESSAGE_PREDICTIONS_READ_FAILED,
    HTTP_ERROR_MESSAGE_PREDICTIONS_DATE_PARSE_FAILED,
)
from utils.tests import (
    create_single_test_unit,
    create_test_monthly_projection,
)


# Disable logs for unit tests
logging.disable(logging.CRITICAL)


@tag("fhp", "ingest", "predictions")
class IngestMonthlyPredictionTestCase(TestCase):
    def setUp(self):
        self.unit = create_single_test_unit()

        create_test_monthly_projection(unit=self.unit)

    def test_with_non_post_request(self):
        response = self.client.get(reverse("ingest_fy_monthly"))

        self.assertEqual(response.status_code, 405)

    def test_with_inaccurate_upload_file_name(self):
        with open("utils/tests/data/monthly_predictions.csv", "rb") as preds_file:
            response = self.client.post(reverse("ingest_fy_monthly"), {"preds": preds_file})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_PREDICTIONS_FILE_MISSING)

    def test_with_improperly_formatted_preds(self):
        with open("utils/tests/data/monthly_predictions_mixed_dtypes.csv", "rb") as preds_file:
            response = self.client.post(reverse("ingest_fy_monthly"), {"predictions": preds_file})

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.content.decode("utf-8")[:20], HTTP_ERROR_MESSAGE_PREDICTIONS_READ_FAILED[:20])

    def test_with_improperly_formatted_dates(self):
        with open("utils/tests/data/monthly_predictions_scrambled_date.csv", "rb") as preds_file:
            response = self.client.post(reverse("ingest_fy_monthly"), {"predictions": preds_file})

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.content.decode("utf-8")[:20], HTTP_ERROR_MESSAGE_PREDICTIONS_DATE_PARSE_FAILED[:20])

    def test_successful_ingest(self):
        with open("utils/tests/data/monthly_predictions.csv", "rb") as preds_file:
            response = self.client.post(reverse("ingest_fy_monthly"), {"predictions": preds_file})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(MonthlyPrediction.objects.count(), 5)

    def test_partially_successful_ingest(self):
        with open("utils/tests/data/monthly_predictions_with_duplicates.csv", "rb") as preds_file:
            response = self.client.post(reverse("ingest_fy_monthly"), {"predictions": preds_file})

        self.assertEqual(response.status_code, 205)
        self.assertEqual(MonthlyPrediction.objects.count(), 4)
