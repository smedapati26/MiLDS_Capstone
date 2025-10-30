from django.test import TestCase
from ninja.testing import TestClient

from forms.models import MOSCode
from personnel.api.users.routes import router


class FormTypesEndpointsTests(TestCase):
    """
    Test the endpoints that return lists of form-related types
    """

    def setUp(self):
        self.client = TestClient(router)

    def test_list_mos_codes(self):
        """Test the MOS codes endpoint returns 200 and correct data structure"""
        MOSCode.objects.create(mos="15T", mos_description="Test MOS", amtp_mos=True, ictl_mos=True)

        # Test the endpoint with type "all"
        response = self.client.get("/mos_codes/all")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        self.assertTrue(len(response.json()) > 0)

        # Check for expected fields
        mos_code = response.json()[0]
        self.assertIn("MOS", mos_code)
        self.assertIn("MOS_Description", mos_code)

        # Check for specific data
        self.assertTrue(any(item["MOS"] == "15T" for item in response.json()))
