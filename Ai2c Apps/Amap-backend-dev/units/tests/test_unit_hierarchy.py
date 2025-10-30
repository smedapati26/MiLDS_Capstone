from datetime import date

from django.test import TestCase
from ninja.testing import TestClient

from tasks.model_utils import Proponent, SkillLevel
from tasks.models import MOS, Ictl, MosIctls
from units.api.routes import router
from units.models import Unit
from utils.tests import create_testing_unit


class TestUnitUCTLEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(
            uic="P001", short_name="Parent Unit", display_name="Parent Unit Display", echelon=Unit.Echelon.BATTALION
        )

        self.target_unit = create_testing_unit(
            uic="T001",
            short_name="Target Unit",
            display_name="Target Unit Display",
            echelon=Unit.Echelon.COMPANY,
            parent_unit=self.parent_unit,
        )

        self.child_unit1 = create_testing_unit(
            uic="C001",
            short_name="Child Unit 1",
            display_name="Child Unit 1 Display",
            echelon=Unit.Echelon.PLATOON,
            parent_unit=self.target_unit,
        )

        self.child_unit2 = create_testing_unit(
            uic="C002",
            short_name="Child Unit 2",
            display_name="Child Unit 2 Display",
            echelon=Unit.Echelon.PLATOON,
            parent_unit=self.target_unit,
        )

        self.parent_unit.child_uics = [self.target_unit.uic]
        self.parent_unit.subordinate_uics = [self.target_unit.uic, self.child_unit1.uic, self.child_unit2.uic]
        self.parent_unit.save()

        self.target_unit.child_uics = [self.child_unit1.uic, self.child_unit2.uic]
        self.target_unit.subordinate_uics = [self.child_unit1.uic, self.child_unit2.uic]
        self.target_unit.save()

        self.mos_15r = MOS.objects.create(mos_code="15R")
        self.mos_15t = MOS.objects.create(mos_code="15T")

        self.parent_uctl = Ictl.objects.create(
            ictl_title="Parent Unit UCTL",
            date_published=date(2023, 1, 1),
            proponent=Proponent.Unit,
            unit=self.parent_unit,
            status="Approved",
            skill_level=SkillLevel.SL1,
        )
        MosIctls.objects.create(mos=self.mos_15r, ictl=self.parent_uctl)

        self.target_uctl1 = Ictl.objects.create(
            ictl_title="Target Unit UCTL 1",
            date_published=date(2023, 2, 1),
            proponent=Proponent.Unit,
            unit=self.target_unit,
            status="Approved",
            skill_level=SkillLevel.SL1,
        )
        MosIctls.objects.create(mos=self.mos_15r, ictl=self.target_uctl1)

        self.target_uctl2 = Ictl.objects.create(
            ictl_title="Target Unit UCTL 2",
            date_published=date(2023, 2, 2),
            proponent=Proponent.Unit,
            unit=self.target_unit,
            status="Approved",
            skill_level=SkillLevel.SL2,
        )
        MosIctls.objects.create(mos=self.mos_15t, ictl=self.target_uctl2)

        self.child1_uctl = Ictl.objects.create(
            ictl_title="Child Unit 1 UCTL",
            date_published=date(2023, 3, 1),
            proponent=Proponent.Unit,
            unit=self.child_unit1,
            status="Approved",
            skill_level=SkillLevel.SL1,
        )
        MosIctls.objects.create(mos=self.mos_15r, ictl=self.child1_uctl)
        MosIctls.objects.create(mos=self.mos_15t, ictl=self.child1_uctl)

    def test_get_unit_uctl_mos_breakdown_success(self):
        """Test successful retrieval of UCTL MOS breakdown"""
        response = self.client.get(f"/unit/{self.target_unit.uic}/unit_hierarchy")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIsNotNone(data["parent_unit"])
        self.assertEqual(data["parent_unit"]["uic"], self.parent_unit.uic)
        self.assertEqual(data["parent_unit"]["short_name"], "Parent Unit")
        self.assertEqual(data["parent_unit"]["mos_skill_levels"]["15R"], ["SL1"])

        self.assertEqual(data["target_unit"]["uic"], self.target_unit.uic)
        self.assertEqual(data["target_unit"]["short_name"], "Target Unit")
        self.assertEqual(data["target_unit"]["mos_skill_levels"]["15R"], ["SL1"])
        self.assertEqual(data["target_unit"]["mos_skill_levels"]["15T"], ["SL2"])

        self.assertEqual(len(data["child_units"]), 2)

        child1_data = next(child for child in data["child_units"] if child["uic"] == self.child_unit1.uic)
        child2_data = next(child for child in data["child_units"] if child["uic"] == self.child_unit2.uic)

        self.assertEqual(child1_data["short_name"], "Child Unit 1")
        self.assertEqual(child1_data["mos_skill_levels"]["15R"], ["SL1"])
        self.assertEqual(child1_data["mos_skill_levels"]["15T"], ["SL1"])

        self.assertEqual(child2_data["short_name"], "Child Unit 2")
        self.assertEqual(child2_data["mos_skill_levels"], {})

    def test_get_unit_uctl_mos_breakdown_no_parent(self):
        """Test endpoint with unit that has no parent"""
        response = self.client.get(f"/unit/{self.parent_unit.uic}/unit_hierarchy")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIsNone(data["parent_unit"])

        self.assertEqual(data["target_unit"]["uic"], self.parent_unit.uic)

        self.assertEqual(len(data["child_units"]), 1)
        self.assertEqual(data["child_units"][0]["uic"], self.target_unit.uic)

    def test_get_unit_uctl_mos_breakdown_no_children(self):
        """Test endpoint with unit that has no children"""
        response = self.client.get(f"/unit/{self.child_unit1.uic}/unit_hierarchy")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["parent_unit"]["uic"], self.target_unit.uic)

        self.assertEqual(data["target_unit"]["uic"], self.child_unit1.uic)

        self.assertEqual(len(data["child_units"]), 0)

    def test_get_unit_uctl_mos_breakdown_no_uctls(self):
        """Test endpoint with units that have no UCTLs"""
        empty_unit = create_testing_unit(
            uic="E001", short_name="Empty Unit", display_name="Empty Unit Display", echelon=Unit.Echelon.COMPANY
        )

        response = self.client.get(f"/unit/{empty_unit.uic}/unit_hierarchy")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIsNone(data["parent_unit"])

        self.assertEqual(data["target_unit"]["uic"], empty_unit.uic)
        self.assertEqual(data["target_unit"]["mos_skill_levels"], {})

        self.assertEqual(len(data["child_units"]), 0)

    def test_get_unit_uctl_mos_breakdown_invalid_unit(self):
        """Test endpoint with invalid unit UIC"""
        response = self.client.get("/unit/INVALID/unit_hierarchy")

        self.assertEqual(response.status_code, 404)

    def test_multiple_skill_levels_same_mos(self):
        """Test that multiple skill levels for same MOS are properly aggregated"""
        target_uctl3 = Ictl.objects.create(
            ictl_title="Target Unit UCTL 3",
            date_published=date(2023, 2, 3),
            proponent=Proponent.Unit,
            unit=self.target_unit,
            status="Approved",
            skill_level=SkillLevel.SL3,
        )
        MosIctls.objects.create(mos=self.mos_15r, ictl=target_uctl3)

        response = self.client.get(f"/unit/{self.target_unit.uic}/unit_hierarchy")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["target_unit"]["mos_skill_levels"]["15R"], ["SL1", "SL3"])

    def test_usaace_ictls_excluded(self):
        """Test that USAACE ICTLs are excluded from results"""
        usaace_ictl = Ictl.objects.create(
            ictl_title="USAACE ICTL",
            date_published=date(2023, 4, 1),
            proponent=Proponent.USAACE,
            unit=self.target_unit,
            status="Approved",
            skill_level=SkillLevel.SL4,
        )
        MosIctls.objects.create(mos=self.mos_15r, ictl=usaace_ictl)

        response = self.client.get(f"/unit/{self.target_unit.uic}/unit_hierarchy")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["target_unit"]["mos_skill_levels"]["15R"], ["SL1"])

    def test_uctl_without_skill_level_excluded(self):
        """Test that UCTLs without skill levels are excluded"""
        no_skill_uctl = Ictl.objects.create(
            ictl_title="No Skill Level UCTL",
            date_published=date(2023, 5, 1),
            proponent=Proponent.Unit,
            unit=self.target_unit,
            status="Approved",
            skill_level=None,
        )
        MosIctls.objects.create(mos=self.mos_15r, ictl=no_skill_uctl)

        response = self.client.get(f"/unit/{self.target_unit.uic}/unit_hierarchy")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["target_unit"]["mos_skill_levels"]["15R"], ["SL1"])
