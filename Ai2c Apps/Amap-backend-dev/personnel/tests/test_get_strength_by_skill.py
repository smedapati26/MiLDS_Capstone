from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.readiness.routes import router
from personnel.model_utils import MxAvailability, Rank
from personnel.models import MTOE, Skill, SoldierFlag
from utils.tests import create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("StrengthBySkill")
class TestStrengthBySkillEndpoint(TestCase):
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

        # Create skills
        self.skill1 = Skill.objects.create(asi_code="F1", description="Flight Engineer")
        self.skill2 = Skill.objects.create(asi_code="P1", description="Parachutist")
        self.skill3 = Skill.objects.create(asi_code="R1", description="Recruiter")

        # Create soldiers
        self.soldiers = []
        ranks_distribution = [Rank.SGT, Rank.SGT, Rank.SSG, Rank.SSG, Rank.SPC, Rank.SPC]

        for i in range(6):
            soldier = create_test_soldier(
                unit=self.unit if i < 4 else self.sub_unit,
                user_id=f"111111{i}",
                rank=ranks_distribution[i],
                first_name=f"Test{i}",
                last_name=f"Soldier{i}",
                is_maintainer=True,
            )
            self.soldiers.append(soldier)

        # Assign skills to soldiers
        # Soldiers 0,1,2 have skill F1
        self.soldiers[0].asi_codes.add(self.skill1)
        self.soldiers[1].asi_codes.add(self.skill1)
        self.soldiers[2].asi_codes.add(self.skill1)

        # Soldiers 3,4,5 have skill P1
        self.soldiers[3].asi_codes.add(self.skill2)
        self.soldiers[4].asi_codes.add(self.skill2)
        self.soldiers[5].asi_codes.add(self.skill2)

        # Soldier 2 also has skill R1 (multiple skills)
        self.soldiers[2].asi_codes.add(self.skill3)

        # Flag soldier 0 as unavailable
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

        # Create MTOE records and assign skills
        mtoe1 = MTOE.objects.create(
            uic=self.unit,
            document_number="TEST001",
            fiscal_year=int(fiscal_year_2digit),
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15T10",
            authorized_strength=5,
        )
        mtoe1.asi_codes.add(self.skill1)

        mtoe2 = MTOE.objects.create(
            uic=self.unit,
            document_number="TEST002",
            fiscal_year=int(fiscal_year_2digit),
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15U20",
            authorized_strength=4,
        )
        mtoe2.asi_codes.add(self.skill2)

        mtoe3 = MTOE.objects.create(
            uic=self.sub_unit,
            document_number="TEST003",
            fiscal_year=int(fiscal_year_2digit),
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15T30",
            authorized_strength=2,
        )
        mtoe3.asi_codes.add(self.skill1)

        self.get_user_id.return_value = self.soldiers[0].user_id

        create_user_role_in_all(soldier=self.soldiers[0], units=[self.unit])

    def test_get_strength_by_skill(self):
        """Test getting personnel strength with all ranks"""
        response = self.client.get(f"/unit/strength_by_skill?uic={self.unit.uic}&ranks=SGT&ranks=SSG&ranks=SPC")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 3)

        skill_f1 = next(s for s in data if s["skill"] == "F1")
        self.assertEqual(skill_f1["total_count"], 3)
        self.assertEqual(skill_f1["available_count"], 2)  # One soldier flagged unavailable
        self.assertEqual(skill_f1["authorized_count"], 7)  # 5 + 2 from MTOE records

        skill_p1 = next(s for s in data if s["skill"] == "P1")
        self.assertEqual(skill_p1["total_count"], 3)
        self.assertEqual(skill_p1["available_count"], 3)
        self.assertEqual(skill_p1["authorized_count"], 4)

        skill_r1 = next(s for s in data if s["skill"] == "R1")
        self.assertEqual(skill_r1["total_count"], 1)  # Only soldier 2 has this skill
        self.assertEqual(skill_r1["available_count"], 1)
        self.assertEqual(skill_r1["authorized_count"], 0)  # No MTOE record for R1

    def test_get_strength_by_skill_with_date(self):
        """Test getting personnel strength with start_date parameter"""
        test_date = date.today()
        response = self.client.get(
            f"/unit/strength_by_skill?uic={self.unit.uic}&start_date={test_date.strftime('%Y-%m-%d')}&ranks=SGT&ranks=SSG&ranks=SPC"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should get same results as without date since we fall back to current data when no historical records exist
        self.assertEqual(len(data), 3)

        skill_f1 = next(s for s in data if s["skill"] == "F1")
        self.assertEqual(skill_f1["total_count"], 3)
        self.assertEqual(skill_f1["available_count"], 2)
        self.assertEqual(skill_f1["authorized_count"], 7)

        skill_p1 = next(s for s in data if s["skill"] == "P1")
        self.assertEqual(skill_p1["total_count"], 3)
        self.assertEqual(skill_p1["available_count"], 3)
        self.assertEqual(skill_p1["authorized_count"], 4)

        skill_r1 = next(s for s in data if s["skill"] == "R1")
        self.assertEqual(skill_r1["total_count"], 1)
        self.assertEqual(skill_r1["available_count"], 1)
        self.assertEqual(skill_r1["authorized_count"], 0)

    def test_get_strength_by_skill_fiscal_year(self):
        """Test fiscal year calculation for MTOE lookup"""
        # Create MTOE record for next fiscal year (2-digit format)
        next_fiscal_year = date.today().year + 2
        next_fiscal_year_2digit = str(next_fiscal_year)[2:]

        mtoe4 = MTOE.objects.create(
            uic=self.unit,
            document_number="TEST004",
            fiscal_year=int(next_fiscal_year_2digit),
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15T40",
            authorized_strength=10,
        )
        mtoe4.asi_codes.add(self.skill1)

        # Test with date in next fiscal year (Oct of next year)
        test_date = date(next_fiscal_year - 1, 10, 1)
        response = self.client.get(
            f"/unit/strength_by_skill?uic={self.unit.uic}&start_date={test_date.strftime('%Y-%m-%d')}&ranks=SGT&ranks=SSG&ranks=SPC"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(len(data) > 0)

        skill_f1 = next((s for s in data if s["skill"] == "F1"), None)
        self.assertIsNotNone(skill_f1)
        # Should only include the next fiscal year MTOE record
        self.assertEqual(skill_f1["authorized_count"], 10)

    def test_get_strength_by_skill_invalid_unit(self):
        """Test response for invalid unit"""
        response = self.client.get("/unit/strength_by_skill?uic=INVALID&ranks=SGT&ranks=SSG&ranks=SPC")
        self.assertEqual(response.status_code, 404)

    def test_get_strength_by_skill_no_mtoe_data(self):
        """Test behavior when no MTOE data exists for a skill"""
        skill4 = Skill.objects.create(asi_code="Z9", description="Test Skill")
        soldier = create_test_soldier(
            unit=self.unit,
            user_id="1111119",
            rank=Rank.SGT,
            first_name="Test",
            last_name="NoMTOE",
            is_maintainer=True,
        )
        soldier.asi_codes.add(skill4)

        response = self.client.get("/unit/strength_by_skill?uic=" + self.unit.uic + "&ranks=SGT&ranks=SSG&ranks=SPC")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        skill_z9 = next(s for s in data if s["skill"] == "Z9")
        self.assertEqual(skill_z9["authorized_count"], 0)
