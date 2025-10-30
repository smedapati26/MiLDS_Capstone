from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.counselings.routes import router
from forms.models import DA_4856
from utils.http.constants import HTTP_SUCCESS_STATUS_CODE
from utils.tests import (
    create_test_4856,
    create_test_4856_pdf,
    create_test_soldier,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("personnel", "get_soldier_da_4856s")
class GetSoldierDA4856(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("forms.api.counselings.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self) -> None:
        self.client = TestClient(router)
        # Create test data using utility functions
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.counseling_pdf = create_test_4856_pdf()
        self.counseling_one = create_test_4856(soldier=self.soldier, document=self.counseling_pdf)

        self.get_user_id.return_value = self.soldier.user_id

        create_user_role_in_all(soldier=self.soldier, units=[self.unit])

    @tag("validation")
    def test_get_soldier_da4856s_invalid_soldier(self):
        """
        Checks that login request with invalid soldier returns 404 error
        """
        response = self.client.get(f"/soldier/INVALID_SOLDIER")
        self.assertEqual(response.status_code, 404)

    @tag("validation")
    def test_get_soldier_da4856s(self):
        """
        Checks that get request returns correct json response
        """
        response = self.client.get(f"/soldier/{self.soldier.user_id}")

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        soldier_counselings = response.json()

        # Verify response structure and content
        self.assertEqual(
            list(soldier_counselings[0].keys()),
            ["id", "date", "title", "uploaded_by", "associated_event", "document"],
        )
        self.assertEqual(len(soldier_counselings), DA_4856.objects.count())

    @tag("validation")
    def test_get_soldier_da4856s_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        endpoint = f"/soldier/{self.soldier.user_id}"

        # PUT - FORBIDDEN
        response = self.client.put(endpoint)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)

        # POST - FORBIDDEN
        response = self.client.post(endpoint)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)

        # PATCH - FORBIDDEN
        response = self.client.patch(endpoint)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)

        # DELETE - FORBIDDEN
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
