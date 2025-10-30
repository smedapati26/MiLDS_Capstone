from django.test import TestCase
from ninja.testing import TestClient

from faults.api.routes import router
from faults.model_utils import FaultStatusCodes


class TestFaultStatusCodesEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

    def test_get_fault_status_codes_success(self):
        """Test that the endpoint returns all fault status codes with correct structure"""
        response = self.client.get("/fault_status_codes")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 7)

        for item in data:
            self.assertIn("value", item)
            self.assertIn("label", item)
            self.assertIsInstance(item["value"], str)
            self.assertIsInstance(item["label"], str)

    def test_fault_status_codes_content(self):
        """Test that the endpoint returns the expected fault status codes"""
        response = self.client.get("/fault_status_codes")
        data = response.json()

        codes_dict = {item["value"]: item["label"] for item in data}

        expected_codes = {
            "X": "Grounding Fault",
            "+": "Commander Underwritten Deficiency",
            "-": "Condition Unknown",
            "/": "Non-Grounding Fault",
            "N": "Nuclear Contamination",
            "B": "Biological Contamination",
            "C": "Chemical Contamination",
        }

        for value, label in expected_codes.items():
            self.assertIn(value, codes_dict)
            self.assertEqual(codes_dict[value], label)
