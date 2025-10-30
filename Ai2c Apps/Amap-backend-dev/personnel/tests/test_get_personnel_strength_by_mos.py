from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.readiness.routes import router
from personnel.model_utils import MxAvailability, Rank
from personnel.models import MTOE, SoldierFlag
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("PersonnelStrengthByMOS")
class TestPersonnelStrengthEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.readiness.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)
        self.unit = create_testing_unit(uic="W11111", short_name="Test Unit", display_name="Test Unit Display")
        self.sub_unit = create_testing_unit(uic="W22222", short_name="Sub Unit", display_name="Sub Unit Display")
        self.unit.subordinate_uics = [self.sub_unit.uic]
        self.unit.save()

        self.mos1 = create_test_mos_code(mos="15T", mos_description="Helicopter Mechanic")
        self.mos2 = create_test_mos_code(mos="15U", mos_description="CH-47 Mechanic")
        self.soldiers = []
        ranks_distribution = [Rank.SGT, Rank.SGT, Rank.SSG, Rank.SSG, Rank.SPC, Rank.SPC]

        for i in range(6):
            soldier = create_test_soldier(
                unit=self.unit if i < 4 else self.sub_unit,
                user_id=f"111111{i}",
                rank=ranks_distribution[i],
                first_name=f"Test{i}",
                last_name=f"Soldier{i}",
                primary_mos=self.mos1 if i < 3 else self.mos2,
                is_maintainer=True,
            )
            self.soldiers.append(soldier)

        self.get_user_id.return_value = self.soldiers[0].user_id
        create_user_role_in_all(soldier=self.soldiers[0], units=[self.unit])

        SoldierFlag.objects.create(
            soldier=self.soldiers[0],
            flag_type="OTHER",
            mx_availability=MxAvailability.UNAVAILABLE,
            start_date=date.today() - timedelta(days=5),
            end_date=date.today() + timedelta(days=5),
        )

        # Create MTOE records with correct fiscal year (2-digit format like production)
        current_year = date.today().year
        if date.today().month >= 10:
            fiscal_year = current_year + 1
        else:
            fiscal_year = current_year

        # Convert to 2-digit format like production data
        fiscal_year_2digit = str(fiscal_year)[2:]

        MTOE.objects.create(
            uic=self.unit,
            document_number="TEST001",
            fiscal_year=int(fiscal_year_2digit),
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15T10",
            authorized_strength=5,
        )
        MTOE.objects.create(
            uic=self.unit,
            document_number="TEST002",
            fiscal_year=int(fiscal_year_2digit),
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15U20",
            authorized_strength=4,
        )
        MTOE.objects.create(
            uic=self.sub_unit,
            document_number="TEST003",
            fiscal_year=int(fiscal_year_2digit),
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15T30",
            authorized_strength=2,
        )

    def test_get_personnel_strength_by_mos(self):
        """Test getting personnel strength with all ranks"""
        response = self.client.get(f"/unit/strength_by_mos?uic={self.unit.uic}&ranks=SGT&ranks=SSG&ranks=SPC")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

        mos_15t = next(m for m in data if m["mos"] == "15T")
        self.assertEqual(mos_15t["total_count"], 3)
        self.assertEqual(mos_15t["available_count"], 2)
        self.assertEqual(mos_15t["authorized_count"], 7)

        mos_15u = next(m for m in data if m["mos"] == "15U")
        self.assertEqual(mos_15u["total_count"], 3)
        self.assertEqual(mos_15u["available_count"], 3)
        self.assertEqual(mos_15u["authorized_count"], 4)

    def test_get_personnel_strength_by_mos_with_date(self):
        """Test getting personnel strength with start_date parameter"""
        test_date = date.today()
        response = self.client.get(
            f"/unit/strength_by_mos?uic={self.unit.uic}&start_date={test_date.strftime('%Y-%m-%d')}&ranks=SGT&ranks=SSG&ranks=SPC"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should get same results as without date since we fall back to current data when no historical records exist
        self.assertEqual(len(data), 2)

        mos_15t = next(m for m in data if m["mos"] == "15T")
        self.assertEqual(mos_15t["total_count"], 3)
        self.assertEqual(mos_15t["available_count"], 2)
        self.assertEqual(mos_15t["authorized_count"], 7)

        mos_15u = next(m for m in data if m["mos"] == "15U")
        self.assertEqual(mos_15u["total_count"], 3)
        self.assertEqual(mos_15u["available_count"], 3)
        self.assertEqual(mos_15u["authorized_count"], 4)

    def test_get_personnel_strength_fiscal_year(self):
        """Test fiscal year calculation for MTOE lookup"""
        # Create MTOE record for next fiscal year (2-digit format)
        next_fiscal_year = date.today().year + 2
        next_fiscal_year_2digit = str(next_fiscal_year)[2:]

        MTOE.objects.create(
            uic=self.unit,
            document_number="TEST004",
            fiscal_year=int(next_fiscal_year_2digit),
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15T40",
            authorized_strength=10,
        )

        # Test with date in next fiscal year (Oct of next year)
        test_date = date(next_fiscal_year - 1, 10, 1)
        response = self.client.get(
            f"/unit/strength_by_mos?uic={self.unit.uic}&start_date={test_date.strftime('%Y-%m-%d')}&ranks=SGT&ranks=SSG&ranks=SPC"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(len(data) > 0)

        mos_15t = next((m for m in data if m["mos"] == "15T"), None)
        self.assertIsNotNone(mos_15t)
        # Should only include the next fiscal year MTOE record
        self.assertEqual(mos_15t["authorized_count"], 10)

    def test_get_personnel_strength_by_mos_invalid_unit(self):
        """Test response for invalid unit"""
        response = self.client.get("/unit/strength_by_mos?uic=INVALID&ranks=SGT&ranks=SSG&ranks=SPC")
        self.assertEqual(response.status_code, 404)

    def test_get_personnel_strength_by_mos_no_mtoe_data(self):
        """Test behavior when no MTOE data exists for a MOS"""
        mos3 = create_test_mos_code(mos="15V", mos_description="Test MOS")
        create_test_soldier(
            unit=self.unit,
            user_id="1111119",
            rank=Rank.SGT,
            first_name="Test",
            last_name="NoMTOE",
            primary_mos=mos3,
            is_maintainer=True,
        )

        response = self.client.get("/unit/strength_by_mos?uic=" + self.unit.uic + "&ranks=SGT&ranks=SSG&ranks=SPC")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        mos_15v = next(m for m in data if m["mos"] == "15V")
        self.assertEqual(mos_15v["authorized_count"], 0)
