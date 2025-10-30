from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.readiness.routes import router
from personnel.models import PhaseTeam
from utils.tests import create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("PhaseRoutes")
class PhaseTeamTestCase(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.readiness.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.unit = create_testing_unit()
        self.user = create_test_soldier(self.unit)
        self.other_user = create_test_soldier(self.unit, user_id="0987654321")
        self.assistant_user = create_test_soldier(self.unit, user_id="0246897531")

        self.client = TestClient(router, headers={"Auth-User": self.user.user_id})
        self.phase_id = 12345

        self.get_user_id.return_value = self.user.user_id

        create_user_role_in_all(soldier=self.user, units=[self.unit])

    def test_get_phase_maintainers(self):
        """Test fetching phase maintainers with availability flag"""
        # Set a date range
        start_date = date.today()
        end_date = date.today() + timedelta(days=5)

        url = f"/unit/phase-maintainers?uic={self.unit.uic}&start_date={start_date}&end_date={end_date}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(any(item["user_id"] == self.user.user_id for item in response.json()))

    def test_create_phase_team(self):
        """Test creating a phase team"""
        payload = {
            "phase_lead_user_id": self.user.user_id,
            "assistant_phase_lead_user_id": self.assistant_user.user_id,
            "phase_members": [self.user.user_id, self.assistant_user.user_id],
        }

        response = self.client.post(f"/phase-team/{self.phase_id}", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("id", response.json())

    def test_get_phase_team(self):
        """Test getting a phase team (after creation)"""
        PhaseTeam.objects.create(
            phase_id=self.phase_id,
            phase_lead=self.user,
            assistant_phase_lead=self.assistant_user,
            phase_members=[self.user.user_id, self.assistant_user.user_id],
        )

        response = self.client.get(f"/phase-team/{self.phase_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["phase_id"], self.phase_id)
        self.assertEqual(response.json()["phase_lead_user_id"], self.user.user_id)

    def test_update_phase_team(self):
        """Test updating a phase team"""
        team = PhaseTeam.objects.create(
            phase_id=self.phase_id,
            phase_lead=self.user,
            assistant_phase_lead=self.assistant_user,
            phase_members=[self.user.user_id],
        )

        update_payload = {
            "phase_lead_user_id": self.other_user.user_id,
            "assistant_phase_lead_user_id": self.user.user_id,
            "phase_members": [self.user.user_id, self.other_user.user_id],
        }

        response = self.client.put(f"/phase-team/{self.phase_id}", json=update_payload)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])

        team.refresh_from_db()
        self.assertEqual(team.phase_lead.user_id, self.other_user.user_id)
        self.assertEqual(len(team.phase_members), 2)

    def test_delete_phase_team(self):
        """Test deleting a phase team"""
        team = PhaseTeam.objects.create(
            phase_id=self.phase_id,
            phase_lead=self.user,
            assistant_phase_lead=self.assistant_user,
            phase_members=[self.user.user_id],
        )

        response = self.client.delete(f"/phase-team/{self.phase_id}")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
