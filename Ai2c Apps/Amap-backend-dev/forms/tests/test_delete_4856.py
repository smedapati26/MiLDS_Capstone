from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.counselings.routes import router
from forms.models import DA_4856
from utils.tests import create_test_4856, create_test_4856_pdf, create_test_soldier, create_testing_unit


@tag("forms", "DA_4856", "delete")
class DeleteDA4856Tests(TestCase):
    def setUp(self):
        self.client = TestClient(router)
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        da_4856_pdf = create_test_4856_pdf()
        self.da_4856 = create_test_4856(soldier=self.soldier, document=da_4856_pdf)

    @patch("utils.http.user_id.get_user_string")
    def test_invalid_4856_id(self, mock_get_user_string):
        mock_user_string = f"CN=DOE.JOHN.A.{self.soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request with an invalid ID
        resp = self.client.delete(f"/{51198}")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)

        # Assert data is updated as expected
        self.assertEqual(DA_4856.objects.count(), 1)

    @patch("utils.http.user_id.get_user_string")
    def test_valid_request(self, mock_get_user_string):
        mock_user_string = f"CN=DOE.JOHN.A.{self.soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request
        resp = self.client.delete(f"/{self.da_4856.id}")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.json(), f"DA4856 ({self.da_4856.title}) removed from User's view.")

        # Refresh from database and verify the object is now invisible
        self.da_4856.refresh_from_db()
        self.assertEqual(self.da_4856.visible_to_user, False)
