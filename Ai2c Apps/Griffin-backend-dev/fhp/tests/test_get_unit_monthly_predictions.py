import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import create_single_test_unit, create_test_monthly_prediction


@tag("fhp", "read", "predictions")
class MonthlyPredictionReadTestCase(TestCase):
    def setUp(self):
        self.unit = create_single_test_unit()

        create_test_monthly_prediction(unit=self.unit)

    def test_get_predictions_for_invalid_unit(self):
        res = self.client.get(reverse("fhp_unit_monthly_predictions", kwargs={"uic": "NOT" + self.unit.uic}))

        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_get_predictions_for_unit(self):
        res = self.client.get(reverse("fhp_unit_monthly_predictions", kwargs={"uic": self.unit.uic}))

        self.assertEqual(res.status_code, HTTPStatus.OK)

        predictions_data = json.loads(res.content)

        prediction_columns = ["unit", "mds", "reporting_month", "predicted_hours", "model", "prediction_date"]

        self.assertCountEqual(list(predictions_data[0].keys()), prediction_columns)

        self.assertGreater(len(predictions_data), 0)
