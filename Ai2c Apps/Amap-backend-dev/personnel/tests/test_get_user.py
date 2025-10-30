from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.models import Event
from personnel.api.users.routes import router
from personnel.model_utils import Months
from personnel.models import MOSCode, Soldier, Unit
from utils.tests import (
    create_single_test_event,
    create_test_designation,
    create_test_soldier,
    create_test_soldier_designation,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("GetUser")
class TestUserEndpoints(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.users.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)

        self.get_user_id.return_value = self.soldier.user_id

        create_user_role_in_all(soldier=self.soldier, units=[self.unit])

    @patch("personnel.api.users.routes.get_prevailing_user_status")
    @patch("personnel.api.users.routes.get_soldier_mos_ml")
    @patch("personnel.api.users.routes.get_soldier_designations")
    def test_get_user(self, mock_get_designations, mock_get_mos_ml, mock_get_status):
        # Set up mock return values
        mock_get_status.return_value = "Available"
        mock_get_mos_ml.side_effect = ["ML3", {"primary": "ML3"}]
        mock_get_designations.return_value = "TI"

        # Test the endpoint
        response = self.client.get(f"/{self.soldier.user_id}")

        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Verify key fields
        self.assertEqual(data["user_id"], self.soldier.user_id)
        self.assertEqual(data["rank"], self.soldier.rank)
        self.assertEqual(data["first_name"], self.soldier.first_name)
        self.assertEqual(data["last_name"], self.soldier.last_name)
        self.assertEqual(data["unit_id"], self.unit.uic)
        self.assertEqual(data["availability_status"], "Available")
        self.assertEqual(data["primary_mos"], self.soldier.primary_mos.mos)
        self.assertEqual(data["primary_ml"], "ML3")
        self.assertEqual(data["all_mos_and_ml"], {"primary": "ML3"})
        self.assertEqual(data["designations"], "TI")

        # Verify mock calls
        mock_get_status.assert_called_once_with(self.soldier)
        mock_get_mos_ml.assert_any_call(self.soldier)
        mock_get_mos_ml.assert_any_call(self.soldier, all=True)
        mock_get_designations.assert_called_once_with(self.soldier.user_id)

    def test_get_user_not_found(self):
        # Test with a non-existent user ID
        response = self.client.get("/nonexistentid")
        self.assertEqual(response.status_code, 404)
