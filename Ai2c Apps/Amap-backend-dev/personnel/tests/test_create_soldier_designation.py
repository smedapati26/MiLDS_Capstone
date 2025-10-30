from datetime import datetime
from io import BytesIO
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from ninja.testing import TestClient

from forms.models import SupportingDocument
from personnel.api.soldier_designation.routes import soldier_designation_router
from personnel.model_utils import Rank
from personnel.models import Designation, SoldierDesignation
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit, create_user_role_in_all


class TestCreateSoldierDesignation(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.soldier_designation.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(soldier_designation_router)

        self.unit = create_testing_unit(uic="W12345", short_name="Test Unit", display_name="Test Unit Display")

        self.mos = create_test_mos_code(mos="15R", mos_description="Test MOS")

        self.soldier = create_test_soldier(
            unit=self.unit,
            user_id="1234567890",
            rank=Rank.SGT,
            first_name="John",
            last_name="Doe",
            primary_mos=self.mos,
        )

        self.creating_soldier = create_test_soldier(
            unit=self.unit,
            user_id="0987654321",
            rank=Rank.SSG,
            first_name="Jane",
            last_name="Smith",
            primary_mos=self.mos,
        )

        self.designation = Designation.objects.create(type="Safety NCO", description="Unit Safety NCO")

        self.headers = {"Auth-User": f"CN=SMITH.JANE.A.{self.creating_soldier.user_id}"}

        self.get_user_id.return_value = self.creating_soldier.user_id

        create_user_role_in_all(soldier=self.creating_soldier, units=[self.unit])

    def test_get_all_designations(self):
        """Test retrieving all designation types"""
        response = self.client.get("/types")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["type"], "Safety NCO")

    def test_get_soldier_designations_empty(self):
        """Test getting designations for soldier with none"""
        response = self.client.get(f"/soldier/{self.soldier.user_id}")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 0)

    def test_get_soldier_designations(self):
        """Test getting soldier's designations"""
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation,
            unit=self.unit,
            start_date=datetime(2024, 1, 1),
            end_date=datetime(2024, 12, 31),
            designation_removed=False,
        )

        response = self.client.get(f"/soldier/{self.soldier.user_id}")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["designation"], "Safety NCO")
        self.assertEqual(data[0]["unit"], "Test Unit Display")

    def test_get_soldier_designations_current_only(self):
        """Test filtering for current designations only"""
        # Create expired designation
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation,
            unit=self.unit,
            start_date=datetime(2023, 1, 1),
            end_date=datetime(2023, 12, 31),
            designation_removed=False,
        )

        # Create current designation
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation,
            unit=self.unit,
            start_date=datetime(2024, 1, 1),
            end_date=datetime(2025, 12, 31),
            designation_removed=False,
        )

        response = self.client.get(f"/soldier/{self.soldier.user_id}?current=true")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)

    def test_create_designation_without_file(self):
        """Test creating a designation without supporting document"""
        payload = {
            "soldier_id": self.soldier.user_id,
            "unit_uic": self.unit.uic,
            "designation": "Safety NCO",
            "start_date": "2024-01-15",
            "end_date": "2024-12-31",
        }

        response = self.client.post("", data=payload, headers=self.headers)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("designation_id", data)
        self.assertIn("Safety NCO", data["message"])

        # Verify designation was created
        designation = SoldierDesignation.objects.get(id=data["designation_id"])
        self.assertEqual(designation.soldier, self.soldier)
        self.assertEqual(designation.designation, self.designation)
        self.assertEqual(designation.unit, self.unit)
        self.assertFalse(designation.designation_removed)

    def test_create_designation_with_file(self):
        """Test creating a designation with supporting document"""
        fake_file = SimpleUploadedFile("appointment_order.pdf", b"fake pdf content", content_type="application/pdf")

        payload = {
            "soldier_id": self.soldier.user_id,
            "unit_uic": self.unit.uic,
            "designation": "Safety NCO",
            "start_date": "2024-01-15",
            "end_date": "2024-12-31",
        }

        response = self.client.post("", data=payload, FILES={"file": fake_file}, headers=self.headers)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("designation_id", data)

        # Verify designation was created
        designation = SoldierDesignation.objects.get(id=data["designation_id"])
        self.assertEqual(designation.soldier, self.soldier)

        # Verify supporting document was created and linked
        supporting_doc = SupportingDocument.objects.filter(related_designation=designation).first()
        self.assertIsNotNone(supporting_doc)
        self.assertEqual(supporting_doc.soldier, self.soldier)
        self.assertEqual(supporting_doc.uploaded_by, self.creating_soldier)
        self.assertIn("Safety NCO", supporting_doc.document_title)
        self.assertIn("Doe", supporting_doc.document_title)

    def test_create_designation_without_end_date(self):
        """Test creating an indefinite designation"""
        payload = {
            "soldier_id": self.soldier.user_id,
            "unit_uic": self.unit.uic,
            "designation": "Safety NCO",
            "start_date": "2024-01-15",
        }

        response = self.client.post("", data=payload, headers=self.headers)

        self.assertEqual(response.status_code, 200)
        data = response.json()

        designation = SoldierDesignation.objects.get(id=data["designation_id"])
        self.assertIsNone(designation.end_date)

    def test_create_designation_invalid_date_format(self):
        """Test validation of date format"""
        payload = {
            "soldier_id": self.soldier.user_id,
            "unit_uic": self.unit.uic,
            "designation": "Safety NCO",
            "start_date": "01/15/2024",  # Wrong format
        }

        response = self.client.post("", data=payload, headers=self.headers)

        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid start_date format", response.json()["detail"])
