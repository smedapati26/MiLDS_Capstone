from datetime import date, datetime, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from django.utils import timezone
from ninja.testing import TestClient

from forms.models import Event
from personnel.api.readiness.routes import router
from personnel.model_utils import MaintenanceLevel, Rank
from personnel.models import MTOE, MOSCode, Soldier, Unit
from personnel.utils.time.reporting_periods import get_reporting_period
from utils.tests import (
    create_single_test_event,
    create_test_mos_code,
    create_test_soldier,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("ActualAuthorizedMaintainerCount")
class TestActualVsAuthorizedMaintainerMOSCounts(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.readiness.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(
            uic="W12345", short_name="Parent Unit", display_name="Parent Test Unit", echelon=Unit.Echelon.BATTALION
        )
        self.child_unit = create_testing_unit(
            uic="W12346",
            short_name="Child Unit",
            display_name="Child Test Unit",
            echelon=Unit.Echelon.COMPANY,
            parent_unit=self.parent_unit,
        )
        self.parent_unit.subordinate_uics = [self.child_unit.uic]
        self.parent_unit.save()

        self.mos_15r = create_test_mos_code(mos="15R", mos_description="Attack Helicopter Repairer")
        self.mos_15t = create_test_mos_code(mos="15T", mos_description="UH-60 Helicopter Repairer")
        self.mos_15u = create_test_mos_code(mos="15U", mos_description="Chinook Helicopter Repairer")
        self.mos_15z = create_test_mos_code(mos="15Z", mos_description="Aircraft Electrician")
        self.mos_other = create_test_mos_code(mos="11B", mos_description="Infantry")

        self.soldier_15r = create_test_soldier(
            unit=self.parent_unit,
            user_id="1234567890",
            rank=Rank.SSG,
            first_name="John",
            last_name="Doe",
            primary_mos=self.mos_15r,
            is_maintainer=True,
        )

        self.soldier_15t = create_test_soldier(
            unit=self.child_unit,
            user_id="1234567891",
            rank=Rank.SGT,
            first_name="Jane",
            last_name="Smith",
            primary_mos=self.mos_15t,
            is_maintainer=True,
        )

        self.soldier_15u = create_test_soldier(
            unit=self.parent_unit,
            user_id="1234567892",
            rank=Rank.SPC,
            first_name="Bob",
            last_name="Johnson",
            primary_mos=self.mos_15u,
            is_maintainer=True,
        )

        self.soldier_other = create_test_soldier(
            unit=self.parent_unit,
            user_id="1234567893",
            rank=Rank.PFC,
            first_name="Alice",
            last_name="Brown",
            primary_mos=self.mos_other,
            is_maintainer=True,
        )

        self.mtoe_15r = MTOE.objects.create(
            uic=self.parent_unit,
            document_number="TEST001",
            fiscal_year=2024,
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15R10",
            authorized_strength=5,
            required_strength=5,
        )

        self.mtoe_15t = MTOE.objects.create(
            uic=self.child_unit,
            document_number="TEST002",
            fiscal_year=2024,
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15T20",
            authorized_strength=3,
            required_strength=3,
        )

        self.mtoe_15u = MTOE.objects.create(
            uic=self.parent_unit,
            document_number="TEST003",
            fiscal_year=2024,
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15U30",
            authorized_strength=2,
            required_strength=2,
        )

        self.mtoe_other = MTOE.objects.create(
            uic=self.parent_unit,
            document_number="TEST004",
            fiscal_year=2024,
            change_number=1,
            major_army_command_codes="TEST",
            position_code="11B40",
            authorized_strength=10,
            required_strength=10,
        )

        self.test_date = date.today()
        self.test_date_str = self.test_date.strftime("%Y%m%d")

        self.get_user_id.return_value = self.soldier_15r.user_id

        create_user_role_in_all(soldier=self.soldier_15r, units=[self.parent_unit])

    def test_endpoint_success_no_mos_filter(self):
        """Test endpoint returns data for all aviation MOS codes when no filter provided"""
        response = self.client.get(
            "/unit/actual_authorized_personnel_by_mos?uic=" + self.parent_unit.uic + "&date=" + self.test_date_str
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Verify maintainer totals
        maintainer_counts = data["maintainer_counts"]
        self.assertEqual(maintainer_counts["actual_total"], 4)
        self.assertEqual(maintainer_counts["authorized_total"], 20)

        # Check specific MOS counts
        mos_counts = {crew["mos"]: crew for crew in data["crew_counts"]}
        self.assertEqual(mos_counts["15R"]["actual_count"], 1)
        self.assertEqual(mos_counts["15R"]["authorized_count"], 5)
        self.assertEqual(mos_counts["15T"]["actual_count"], 1)
        self.assertEqual(mos_counts["15T"]["authorized_count"], 3)
        self.assertEqual(mos_counts["15U"]["actual_count"], 1)
        self.assertEqual(mos_counts["15U"]["authorized_count"], 2)
        self.assertEqual(mos_counts["15Z"]["actual_count"], 0)
        self.assertEqual(mos_counts["15Z"]["authorized_count"], 0)

    def test_endpoint_success_with_mos_filter(self):
        """Test endpoint returns data for specific MOS when filter provided"""
        response = self.client.get(
            "/unit/actual_authorized_personnel_by_mos?uic="
            + self.parent_unit.uic
            + "&date="
            + self.test_date_str
            + "&mos=15R"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should still have all maintainers in total
        maintainer_counts = data["maintainer_counts"]
        self.assertEqual(maintainer_counts["actual_total"], 4)

        # Should only have one MOS in crew counts
        crew_counts = data["crew_counts"]
        self.assertEqual(len(crew_counts), 1)
        self.assertEqual(crew_counts[0]["mos"], "15R")
        self.assertEqual(crew_counts[0]["actual_count"], 1)
        self.assertEqual(crew_counts[0]["authorized_count"], 5)

    def test_endpoint_invalid_date_format(self):
        """Test endpoint returns 400 for invalid date format"""
        response = self.client.get(
            "/unit/actual_authorized_personnel_by_mos?uic=" + self.parent_unit.uic + "&date=invalid-date"
        )
        self.assertEqual(response.status_code, 400)

    def test_endpoint_invalid_unit(self):
        """Test endpoint returns 404 for invalid unit"""
        response = self.client.get(
            "/unit/actual_authorized_personnel_by_mos", params={"uic": "INVALID", "date": self.test_date_str}
        )
        response = self.client.get("/unit/actual_authorized_personnel_by_mos?uic=INVALID&date=" + self.test_date_str)

        self.assertEqual(response.status_code, 404)

    def test_endpoint_invalid_mos(self):
        """Test endpoint returns 404 for invalid MOS"""
        response = self.client.get(
            "/unit/actual_authorized_personnel_by_mos?uic="
            + self.parent_unit.uic
            + "&date="
            + self.test_date_str
            + "&mos=INVALID"
        )

        self.assertEqual(response.status_code, 404)

    def test_soldiers_without_primary_mos_excluded(self):
        """Test that soldiers without primary MOS are excluded"""
        # Create soldier without primary MOS
        no_mos_soldier = Soldier.objects.create(
            unit=self.parent_unit,
            user_id="6666666666",
            rank=Rank.PV2,
            first_name="No",
            last_name="MOS",
            primary_mos=None,
            is_maintainer=True,
        )

        response = self.client.get(
            "/unit/actual_authorized_personnel_by_mos?uic=" + self.parent_unit.uic + "&date=" + self.test_date_str
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Total maintainers should still be 4 (excluding soldier with no MOS)
        maintainer_counts = data["maintainer_counts"]
        self.assertEqual(maintainer_counts["actual_total"], 4)

    def test_zero_counts_handled_correctly(self):
        """Test that zero counts are returned correctly"""
        # Remove all soldiers with aviation MOS
        Soldier.objects.filter(primary_mos__mos__in=["15R", "15T", "15U", "15Z"]).delete()
        create_user_role_in_all(soldier=self.soldier_other, units=[self.parent_unit])
        self.get_user_id.return_value = self.soldier_other.user_id

        response = self.client.get(
            "/unit/actual_authorized_personnel_by_mos?uic=" + self.parent_unit.uic + "&date=" + self.test_date_str
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # All aviation MOS should have 0 actual count
        crew_counts = data["crew_counts"]
        for crew in crew_counts:
            if crew["mos"] in ["15R", "15T", "15U", "15Z"]:
                self.assertEqual(crew["actual_count"], 0)
