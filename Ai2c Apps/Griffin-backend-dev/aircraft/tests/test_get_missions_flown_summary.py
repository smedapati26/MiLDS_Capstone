from datetime import date
from unittest.mock import patch

from django.test import TestCase
from ninja.testing import TestClient

from aircraft.api.readiness.routes import readiness_router
from aircraft.model_utils import FlightMissionTypes
from utils.tests import create_single_test_aircraft, create_test_flights, create_test_units, create_test_user


class TestMissionsFlownSummary(TestCase):
    def setUp(self):
        # Create test units using the helper function
        self.units, self.unit_hierarchy = create_test_units(
            uic_stub="TEST",
            echelon="BN",
            short_name="Test Unit",
            display_name="Test Unit",
        )
        self.parent_unit = self.units.filter(uic="TESTAA").first()
        self.child_unit = self.units.filter(uic="TESTA0").first()

        # Create test aircraft using helper
        self.aircraft = create_single_test_aircraft(serial="12345", model="TEST-AC", current_unit=self.parent_unit)

        # Create test flights with different mission types using helper
        self.flights = create_test_flights(
            aircraft=self.aircraft,
            parent_unit=self.parent_unit,
            child_unit=self.child_unit,
            training_count=3,
            combat_count=2,
            training_hours=2.0,
            combat_hours=3.0,
        )

        # Create test user and client
        self.user = create_test_user(unit=self.parent_unit)
        self.client = TestClient(readiness_router, headers={"Auth-User": self.user.user_id})

    def test_missions_flown_summary_basic(self):
        """Test basic functionality of missions flown summary"""
        response = self.client.get(f"/missions-flown-summary?uic={self.parent_unit.uic}")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should return both training and combat missions
        self.assertEqual(len(data), 2)

        # Verify training missions
        training_data = next(item for item in data if item["mission_type"] == FlightMissionTypes.TRAINING)
        self.assertEqual(training_data["amount_flown"], 3)
        self.assertEqual(training_data["hours_flown"], 6)

        # Verify combat missions
        combat_data = next(item for item in data if item["mission_type"] == FlightMissionTypes.COMBAT)
        self.assertEqual(combat_data["amount_flown"], 2)
        self.assertEqual(combat_data["hours_flown"], 6)

    def test_missions_flown_summary_date_range(self):
        """Test missions flown summary with explicit date range"""
        start_date = date(2024, 1, 1)
        end_date = date(2024, 1, 2)
        response = self.client.get(
            f"/missions-flown-summary?uic={self.parent_unit.uic}" f"&start_date={start_date}&end_date={end_date}"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should only include flights within the date range
        total_flights = sum(item["amount_flown"] for item in data)
        self.assertEqual(total_flights, 4)

    def test_missions_flown_summary_child_unit(self):
        """Test missions flown summary for child unit"""
        response = self.client.get(f"/missions-flown-summary?uic={self.child_unit.uic}")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should only return combat missions (assigned to child unit)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["mission_type"], FlightMissionTypes.COMBAT)
        self.assertEqual(data[0]["amount_flown"], 2)
        self.assertEqual(data[0]["hours_flown"], 6)

    @patch("utils.time.get_reporting_period")
    def test_missions_flown_summary_default_dates(self, mock_get_reporting_period):
        """Test missions flown summary with default date range"""
        mock_end_date = date(2024, 1, 31)
        mock_get_reporting_period.return_value = (None, mock_end_date)
        response = self.client.get(f"/missions-flown-summary?uic={self.parent_unit.uic}")
        self.assertEqual(response.status_code, 200)
