from django.test import TestCase
from ninja.testing import TestClient

from forms.api.events.routes import router
from forms.models import AwardType, EvaluationType, EventType, TCSLocation, TrainingType


class FormTypesEndpointsTests(TestCase):
    """
    Test the endpoints that return lists of form-related types
    """

    def setUp(self):
        self.client = TestClient(router)
        self.award_type = AwardType.objects.create(type="TEST_AWARD", description="Test Award Type")
        self.evaluation_type = EvaluationType.objects.create(type="TEST_EVAL", description="Test Evaluation Type")
        self.event_type = EventType.objects.create(type="TEST_EVENT", description="Test Event Type")
        self.training_type = TrainingType.objects.create(type="TEST_TRAINING", description="Test Training Type")
        self.tcs_location = TCSLocation.objects.create(abbreviation="TEST", location="Test Location")

    def test_list_award_types(self):
        """Test the award types endpoint returns 200 and correct data structure"""
        response = self.client.get("/award_types")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        self.assertTrue(len(response.json()) > 0)

        # Check for expected fields
        award_type = response.json()[0]
        self.assertIn("Type", award_type)
        self.assertIn("Description", award_type)

        # Check for specific data
        self.assertTrue(any(item["Type"] == "TEST_AWARD" for item in response.json()))

    def test_list_evaluation_types(self):
        """Test the evaluation types endpoint returns 200 and correct data structure"""
        response = self.client.get("/evaluation_types")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        self.assertTrue(len(response.json()) > 0)

        # Check for expected fields
        eval_type = response.json()[0]
        self.assertIn("Type", eval_type)
        self.assertIn("Description", eval_type)

        # Check for specific data
        self.assertTrue(any(item["Type"] == "TEST_EVAL" for item in response.json()))

    def test_list_event_types(self):
        """Test the event types endpoint returns 200 and correct data structure"""
        response = self.client.get("/event_types")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        self.assertTrue(len(response.json()) > 0)

        # Check for expected fields
        event_type = response.json()[0]
        self.assertIn("Type", event_type)
        self.assertIn("Description", event_type)

        # Check for specific data
        self.assertTrue(any(item["Type"] == "TEST_EVENT" for item in response.json()))

    def test_list_training_types(self):
        """Test the training types endpoint returns 200 and correct data structure"""
        response = self.client.get("/training_types")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        self.assertTrue(len(response.json()) > 0)

        # Check for expected fields
        training_type = response.json()[0]
        self.assertIn("Type", training_type)
        self.assertIn("Description", training_type)

        # Check for specific data
        self.assertTrue(any(item["Type"] == "TEST_TRAINING" for item in response.json()))

    def test_list_tcs_locations(self):
        """Test the TCS locations endpoint returns 200 and correct data structure"""
        response = self.client.get("/tcs_locations")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        self.assertTrue(len(response.json()) > 0)

        # Check for expected fields
        tcs_location = response.json()[0]
        self.assertIn("abbreviation", tcs_location)
        self.assertIn("location", tcs_location)

        # Check for specific data
        self.assertTrue(any(item["abbreviation"] == "TEST" for item in response.json()))
