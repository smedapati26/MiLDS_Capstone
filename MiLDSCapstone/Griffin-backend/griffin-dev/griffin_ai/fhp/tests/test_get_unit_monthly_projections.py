from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_unit,
    create_test_monthly_projection,
)


@tag("fhp", "read")
class MonthlyProjectionReadTestCase(TestCase):
    def setUp(self):
        self.unit = create_single_test_unit()

        create_test_monthly_projection(unit=self.unit)

    def test_get_projections_for_invalid_unit(self):
        res = self.client.get(reverse("fhp_unit_monthly_projections", kwargs={"uic": "NOT" + self.unit.uic}))

        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_get_projections_for_unit(self):
        res = self.client.get(reverse("fhp_unit_monthly_projections", kwargs={"uic": self.unit.uic}))

        self.assertEqual(res.status_code, HTTPStatus.OK)

        projections_data = json.loads(res.content)

        projection_columns = ["unit", "model", "reporting_month", "projected_hours"]

        self.assertCountEqual(list(projections_data[0].keys()), projection_columns)

        self.assertGreater(len(projections_data), 0)
