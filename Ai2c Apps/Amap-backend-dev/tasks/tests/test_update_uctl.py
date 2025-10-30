from django.test import TestCase
from ninja.testing import TestClient

from tasks.api.routes import router
from tasks.model_utils import Proponent
from tasks.models import MOS, Ictl, MosIctls
from utils.tests import create_test_ictl, create_test_mos, create_testing_unit


class TestUpdateUCTLEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(uic="W12345", short_name="Parent Unit", display_name="Parent Test Unit")
        self.other_unit = create_testing_unit(uic="W67890", short_name="Other Unit", display_name="Other Test Unit")

        self.mos_15R = create_test_mos(mos_code="15R")
        self.mos_15T = create_test_mos(mos_code="15T")
        self.mos_15U = create_test_mos(mos_code="15U")

        self.uctl = create_test_ictl(
            ictl_id=1,
            ictl_title="Original UCTL",
            unit=self.parent_unit,
            skill_level="SL1",
            target_audience="Original audience",
        )

        MosIctls.objects.create(mos=self.mos_15R, ictl=self.uctl)

    def test_update_uctl_success(self):
        """Test successful UCTL update with field changes"""
        data = {
            "title": "Updated UCTL Title",
            "unit_uic": self.other_unit.uic,
            "mos_codes": ["15T"],
            "skill_level": "SL2",
            "target_audience": "Updated audience",
        }

        response = self.client.put(f"/uctls/{self.uctl.ictl_id}", json=data)

        self.assertEqual(response.status_code, 200)
        response_data = response.json()

        self.assertEqual(response_data["ictl_id"], self.uctl.ictl_id)
        self.assertEqual(response_data["message"], "UCTL 'Updated UCTL Title' updated successfully")

        updated_uctl = Ictl.objects.get(ictl_id=self.uctl.ictl_id)
        self.assertEqual(updated_uctl.ictl_title, "Updated UCTL Title")
        self.assertEqual(updated_uctl.unit, self.other_unit)
        self.assertEqual(updated_uctl.skill_level, "SL2")
        self.assertEqual(updated_uctl.target_audience, "Updated audience")

        mos_relationships = MosIctls.objects.filter(ictl=updated_uctl)
        self.assertEqual(mos_relationships.count(), 1)
        self.assertEqual(mos_relationships.first().mos, self.mos_15T)

    def test_update_uctl_multiple_mos(self):
        """Test UCTL update with multiple MOS codes"""
        data = {
            "title": "Multi-MOS UCTL",
            "unit_uic": self.parent_unit.uic,
            "mos_codes": ["15R", "15T", "15U"],
            "skill_level": "SL3",
            "target_audience": "All maintainers",
        }

        response = self.client.put(f"/uctls/{self.uctl.ictl_id}", json=data)

        self.assertEqual(response.status_code, 200)

        mos_relationships = MosIctls.objects.filter(ictl=self.uctl)
        self.assertEqual(mos_relationships.count(), 3)

        linked_mos_codes = [rel.mos.mos_code for rel in mos_relationships]
        self.assertIn("15R", linked_mos_codes)
        self.assertIn("15T", linked_mos_codes)
        self.assertIn("15U", linked_mos_codes)

    def test_update_uctl_invalid_id(self):
        """Test update with non-existent UCTL ID"""
        data = {
            "title": "Test UCTL",
            "unit_uic": self.parent_unit.uic,
            "mos_codes": ["15R"],
            "skill_level": "SL1",
            "target_audience": "Test audience",
        }

        response = self.client.put("/uctls/999", json=data)

        self.assertEqual(response.status_code, 404)

        original_uctl = Ictl.objects.get(ictl_id=self.uctl.ictl_id)
        self.assertEqual(original_uctl.ictl_title, "Original UCTL")

    def test_update_uctl_invalid_unit(self):
        """Test update with invalid unit UIC"""
        data = {
            "title": "Test UCTL",
            "unit_uic": "INVALID",
            "mos_codes": ["15R"],
            "skill_level": "SL1",
            "target_audience": "Test audience",
        }

        response = self.client.put(f"/uctls/{self.uctl.ictl_id}", json=data)

        self.assertEqual(response.status_code, 404)

        original_uctl = Ictl.objects.get(ictl_id=self.uctl.ictl_id)
        self.assertEqual(original_uctl.ictl_title, "Original UCTL")

    def test_update_uctl_invalid_mos(self):
        """Test update with invalid MOS code"""
        data = {
            "title": "Test UCTL",
            "unit_uic": self.parent_unit.uic,
            "mos_codes": ["INVALID"],
            "skill_level": "SL1",
            "target_audience": "Test audience",
        }

        response = self.client.put(f"/uctls/{self.uctl.ictl_id}", json=data)

        self.assertEqual(response.status_code, 404)

        original_uctl = Ictl.objects.get(ictl_id=self.uctl.ictl_id)
        self.assertEqual(original_uctl.ictl_title, "Original UCTL")

    def test_update_uctl_empty_mos_list(self):
        """Test update with empty MOS codes list"""
        data = {
            "title": "Test UCTL",
            "unit_uic": self.parent_unit.uic,
            "mos_codes": [],
            "skill_level": "SL1",
            "target_audience": "Test audience",
        }

        response = self.client.put(f"/uctls/{self.uctl.ictl_id}", json=data)

        self.assertEqual(response.status_code, 400)

        original_uctl = Ictl.objects.get(ictl_id=self.uctl.ictl_id)
        self.assertEqual(original_uctl.ictl_title, "Original UCTL")
