from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.readiness.routes import router
from utils.http.constants import HTTP_404_UNIT_DOES_NOT_EXIST
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("personnel", "get_unit_maintainers")
class GetUnitMaintainersTest(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.readiness.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self) -> None:
        # Set up the ninja client
        self.client = TestClient(router)
        # Create Units
        self.test_unit = create_testing_unit()
        self.second_unit = create_testing_unit(uic="TEST000B0")
        # Create Maintainer
        self.test_maintainer = create_test_soldier(unit=self.test_unit, is_admin=True)
        # Create Non-Maintainer
        self.mos_code_non_amtp = create_test_mos_code(
            mos="94E", mos_description="Radio Equipment Repairer", amtp_mos=False
        )
        self.test_non_maintainer = create_test_soldier(
            unit=self.test_unit, primary_mos=self.mos_code_non_amtp, user_id="1111111111", is_maintainer=False
        )
        # Create Soldier in a different unit
        self.test_other_maintainer = create_test_soldier(unit=self.second_unit, user_id="2222222222")

        self.get_user_id.return_value = self.test_maintainer.user_id

    @tag("validation")
    def test_get_unit_maintainers_invalid_uic(self):
        """
        Checks that a get request with an invalid uic passed returns a not found error
        """
        response = self.client.get(f"/unit/NOT{self.test_unit.uic}/soldiers/amtp_maintainers")
        self.assertEqual(response.status_code, 404)

    @tag("validation")
    def test_get_unit_maintainers_valid_request(self):
        """
        Checks that a valid get request returns only the maintainers within the passed unit
        """
        # Check for test_unit - 1 maintainer and 1 non maintainer
        response = self.client.get(f"/unit/{self.test_unit.uic}/soldiers/amtp_maintainers")
        unit_maintainers = response.json()["soldiers"]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(unit_maintainers), 1)
        # Check for second_unit - 1 maintainer
        response = self.client.get(f"/unit/{self.second_unit.uic}/soldiers/amtp_maintainers")
        unit_maintainers = response.json()["soldiers"]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(unit_maintainers), 1)

    @tag("validation")
    def test_get_unit_maintainers_other_types(self):
        """
        Checks that other valid request types work properly
        """
        # Check amtp_maintainers_short
        response = self.client.get(f"/unit/{self.test_unit.uic}/soldiers/amtp_maintainers_short")
        self.assertEqual(response.status_code, 200)
        # Check all_maintainers
        response = self.client.get(f"/unit/{self.test_unit.uic}/soldiers/all_maintainers")
        self.assertEqual(response.status_code, 200)
        # Check all_soldiers
        response = self.client.get(f"/unit/{self.test_unit.uic}/soldiers/all_soldiers")
        self.assertEqual(response.status_code, 200)
