from django.test import TestCase
from ninja.testing import TestClient

from personnel.api.soldier_management.routes import soldier_management_router
from personnel.model_utils import Rank, UserRoleAccessLevel
from personnel.models import Soldier, UserRole
from utils.tests import create_testing_unit


class TestCreateSoldier(TestCase):
    def setUp(self):
        self.client = TestClient(soldier_management_router)

        self.unit1 = create_testing_unit(uic="W12345", short_name="Test Unit 1", display_name="Test Unit 1 Display")
        self.unit2 = create_testing_unit(uic="W12346", short_name="Test Unit 2", display_name="Test Unit 2 Display")

    def test_create_soldier_basic(self):
        """Test creating soldier with minimum required fields"""
        data = {
            "dod_id": "1234567890",
            "first_name": "John",
            "last_name": "Doe",
            "rank": "SSG",
            "unit_uic": self.unit1.uic,
        }

        response = self.client.post("/soldiers", json=data)

        self.assertEqual(response.status_code, 200)
        soldier = Soldier.objects.get(user_id="1234567890")
        self.assertEqual(soldier.first_name, "John")
        self.assertEqual(soldier.last_name, "Doe")
        self.assertEqual(soldier.rank, Rank.SSG)
        self.assertEqual(soldier.unit.uic, self.unit1.uic)
        self.assertTrue(soldier.is_maintainer)
        self.assertFalse(soldier.is_admin)

    def test_create_soldier_with_roles(self):
        """Test creating soldier with role assignments"""
        data = {
            "dod_id": "0987654321",
            "first_name": "Jane",
            "last_name": "Smith",
            "rank": "SFC",
            "unit_uic": self.unit1.uic,
            "roles": [{"unit_uic": self.unit2.uic, "role": "Manager"}],
        }

        response = self.client.post("/soldiers", json=data)

        self.assertEqual(response.status_code, 200)
        soldier = Soldier.objects.get(user_id="0987654321")
        roles = UserRole.objects.filter(user_id=soldier)
        self.assertEqual(roles.count(), 1)
        self.assertEqual(roles.first().unit.uic, self.unit2.uic)
        self.assertEqual(roles.first().access_level, UserRoleAccessLevel.MANAGER)

    def test_create_soldier_skips_duplicate_unit_role(self):
        """Test that role for primary unit is skipped"""
        data = {
            "dod_id": "1111111111",
            "first_name": "Bob",
            "last_name": "Johnson",
            "rank": "SGT",
            "unit_uic": self.unit1.uic,
            "roles": [{"unit_uic": self.unit1.uic, "role": "Manager"}],
        }

        response = self.client.post("/soldiers", json=data)

        self.assertEqual(response.status_code, 200)
        soldier = Soldier.objects.get(user_id="1111111111")
        # Role should be skipped because it's for the primary unit
        self.assertEqual(UserRole.objects.filter(user_id=soldier).count(), 0)

    def test_create_soldier_with_optional_flags(self):
        """Test creating soldier with is_maintainer and is_admin flags"""
        data = {
            "dod_id": "2222222222",
            "first_name": "Alice",
            "last_name": "Williams",
            "rank": "MSG",
            "unit_uic": self.unit1.uic,
            "is_maintainer": False,
            "is_admin": True,
        }

        response = self.client.post("/soldiers", json=data)

        self.assertEqual(response.status_code, 200)
        soldier = Soldier.objects.get(user_id="2222222222")
        self.assertFalse(soldier.is_maintainer)
        self.assertTrue(soldier.is_admin)

    def test_create_soldier_invalid_dod_id_length(self):
        """Test validation of dod_id length"""
        data = {"dod_id": "123", "first_name": "Test", "last_name": "User", "rank": "CPL", "unit_uic": self.unit1.uic}

        response = self.client.post("/soldiers", json=data)
        self.assertEqual(response.status_code, 400)

    def test_create_soldier_invalid_rank(self):
        """Test validation of rank"""
        data = {
            "dod_id": "3333333333",
            "first_name": "Test",
            "last_name": "User",
            "rank": "INVALID",
            "unit_uic": self.unit1.uic,
        }

        response = self.client.post("/soldiers", json=data)
        self.assertEqual(response.status_code, 400)

    def test_create_soldier_invalid_unit(self):
        """Test validation of unit existence"""
        data = {"dod_id": "4444444444", "first_name": "Test", "last_name": "User", "rank": "PFC", "unit_uic": "INVALID"}

        response = self.client.post("/soldiers", json=data)
        self.assertEqual(response.status_code, 404)

    def test_create_soldier_invalid_role(self):
        """Test validation of role value"""
        data = {
            "dod_id": "5555555555",
            "first_name": "Test",
            "last_name": "User",
            "rank": "SPC",
            "unit_uic": self.unit1.uic,
            "roles": [{"unit_uic": self.unit2.uic, "role": "SUPERUSER"}],
        }

        response = self.client.post("/soldiers", json=data)
        self.assertEqual(response.status_code, 400)
