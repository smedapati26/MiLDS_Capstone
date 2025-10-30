from datetime import date

from django.test import TestCase
from ninja.testing import TestClient

from tasks.api.routes import router
from tasks.model_utils import Proponent
from tasks.models import Ictl, MosIctls
from utils.tests import create_test_mos, create_testing_unit


class TestCreateUCTLEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(uic="W12345", short_name="Parent Unit", display_name="Parent Test Unit")

        self.mos_15R = create_test_mos(mos_code="15R")
        self.mos_15T = create_test_mos(mos_code="15T")

    def test_create_uctl_success_single_mos(self):
        """Test successful UCTL creation with single MOS"""
        data = {
            "title": "Test UCTL Single MOS",
            "unit_uic": self.parent_unit.uic,
            "mos_codes": ["15R"],
            "skill_level": "SL1",
            "target_audience": "15R maintainers",
        }

        response = self.client.post("/uctls", json=data)

        self.assertEqual(response.status_code, 200)
        response_data = response.json()

        self.assertIn("ictl_id", response_data)
        self.assertIn("message", response_data)
        self.assertEqual(response_data["message"], "UCTL 'Test UCTL Single MOS' created successfully")

        uctl = Ictl.objects.get(ictl_id=response_data["ictl_id"])
        self.assertEqual(uctl.ictl_title, "Test UCTL Single MOS")
        self.assertEqual(uctl.unit, self.parent_unit)
        self.assertEqual(uctl.proponent, Proponent.Unit)
        self.assertEqual(uctl.status, "NOT STARTED")
        self.assertEqual(uctl.skill_level, "SL1")
        self.assertEqual(uctl.target_audience, "15R maintainers")
        self.assertEqual(uctl.date_published, date.today())

        mos_relationships = MosIctls.objects.filter(ictl=uctl)
        self.assertEqual(mos_relationships.count(), 1)
        self.assertEqual(mos_relationships.first().mos, self.mos_15R)

    def test_create_uctl_success_multiple_mos(self):
        """Test successful UCTL creation with multiple MOS codes"""
        data = {
            "title": "Test UCTL Multiple MOS",
            "unit_uic": self.parent_unit.uic,
            "mos_codes": ["15R", "15T"],
            "skill_level": "SL2",
            "target_audience": "All aviation maintainers",
        }

        response = self.client.post("/uctls", json=data)

        self.assertEqual(response.status_code, 200)
        response_data = response.json()

        uctl = Ictl.objects.get(ictl_id=response_data["ictl_id"])
        self.assertEqual(uctl.ictl_title, "Test UCTL Multiple MOS")

        mos_relationships = MosIctls.objects.filter(ictl=uctl)
        self.assertEqual(mos_relationships.count(), 2)

        linked_mos_codes = [rel.mos.mos_code for rel in mos_relationships]
        self.assertIn("15R", linked_mos_codes)
        self.assertIn("15T", linked_mos_codes)

    def test_create_uctl_invalid_unit(self):
        """Test UCTL creation with invalid unit UIC"""
        data = {
            "title": "Test UCTL",
            "unit_uic": "INVALID",
            "mos_codes": ["15R"],
            "skill_level": "SL1",
            "target_audience": "Test audience",
        }

        response = self.client.post("/uctls", json=data)

        self.assertEqual(response.status_code, 404)

        self.assertEqual(Ictl.objects.count(), 0)

    def test_create_uctl_invalid_mos(self):
        """Test UCTL creation with invalid MOS code"""
        data = {
            "title": "Test UCTL",
            "unit_uic": self.parent_unit.uic,
            "mos_codes": ["INVALID"],
            "skill_level": "SL1",
            "target_audience": "Test audience",
        }

        response = self.client.post("/uctls", json=data)

        self.assertEqual(response.status_code, 404)

        self.assertEqual(Ictl.objects.count(), 0)

    def test_create_uctl_empty_mos_list(self):
        """Test UCTL creation with empty MOS codes list"""
        data = {
            "title": "Test UCTL",
            "unit_uic": self.parent_unit.uic,
            "mos_codes": [],
            "skill_level": "SL1",
            "target_audience": "Test audience",
        }

        response = self.client.post("/uctls", json=data)

        self.assertEqual(response.status_code, 400)

        self.assertEqual(Ictl.objects.count(), 0)

    def test_create_uctl_mixed_valid_invalid_mos(self):
        """Test UCTL creation with mix of valid and invalid MOS codes"""
        data = {
            "title": "Test UCTL2",
            "unit_uic": self.parent_unit.uic,
            "mos_codes": ["15R", "INVALID"],
            "skill_level": "SL1",
            "target_audience": "Test audience",
        }

        response = self.client.post("/uctls", json=data)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(Ictl.objects.count(), 0)
