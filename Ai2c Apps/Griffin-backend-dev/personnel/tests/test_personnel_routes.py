from datetime import timedelta

from django.test import TestCase, tag
from django.utils import timezone
from ninja.testing import TestClient

from auto_dsr.models import Unit
from personnel.api.routes import personnel_router
from personnel.models import MTOE, GradeRank, Skill, Soldier
from utils.tests import (
    create_n_skills,
    create_single_test_aircraft,
    create_single_test_airframe,
    create_single_test_mtoe,
    create_single_test_soldier,
    create_soldier,
    create_test_units,
    create_test_user,
    test_create_readiness_level,
)
from utils.tests.test_unit_creation import create_single_test_unit
from utils.time import get_current_fiscal_year


@tag("personnel")
class PersonnelTest(TestCase):
    def setUp(self):
        self.now = timezone.now()
        self.first_units, _ = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        # This also sets first_units to those just created.
        # The create_test_units returns Unit.objects.all()
        # Need to account for the different unit creation.
        self.first_uics = [unit.uic for unit in self.first_units]

        create_test_units(
            uic_stub="TESTING0",
            echelon="BN",
            short_name="101th TEST",
            display_name="101th Test Aviation Regiment",
        )

        self.airframe = create_single_test_airframe(mds="UH-60MX", model="UH-60M")
        self.airframe2 = create_single_test_airframe(mds="UH-60L", model="UH-60L")
        self.airframe3 = create_single_test_airframe(mds="AH-64D", model="AH-64D")

        self.aircraft = create_single_test_aircraft(
            current_unit=self.first_units[0], model=self.airframe.model, airframe=self.airframe
        )
        self.aircraft2 = create_single_test_aircraft(
            current_unit=self.first_units[0], model=self.airframe2.model, airframe=self.airframe2, serial="TEST2"
        )

        skills = create_n_skills(10)

        self.soldiers = []

        rank, _ = GradeRank.objects.get_or_create(code="E1")
        fy = int(str(get_current_fiscal_year())[-2:])
        for i, unit in enumerate(self.first_units):
            self.soldiers.append(create_soldier(uic=self.first_units[0], asi_codes=skills[i:], dodid=f"1234567{i}"))
            self.soldiers.append(create_soldier(uic=self.first_units[0], asi_codes=skills[: i - 1], dodid=f"876543{i}"))
            create_single_test_mtoe(
                uic=unit,
                line_number=f"{i}",
                document_number=f"98765432{i}",
                asi_skills=skills[i:],
                grade=rank,
                position_code="346BC",
                fiscal_year=fy,
                authorized_strength=10,
            )
            create_single_test_mtoe(
                uic=unit,
                line_number=f"A{i}",
                document_number=f"{i}23456789",
                asi_skills=skills[: i - 1],
                grade=rank,
                position_code="34ABC",
                fiscal_year=fy,
                authorized_strength=5,
            )

        self.readiness_levels = []
        self.readiness_levels.append(
            test_create_readiness_level(
                dodid=self.soldiers[0],
                readiness_level="2",
                rl_end_date=None,
                rl_start_date=self.now,
                airframe=self.airframe,
            )
        )
        self.readiness_levels.append(
            test_create_readiness_level(
                dodid=self.soldiers[1],
                readiness_level="2",
                rl_end_date=None,
                rl_start_date=self.now,
                airframe=self.airframe,
            )
        )
        self.readiness_levels.append(
            test_create_readiness_level(
                dodid=self.soldiers[2],
                readiness_level="1",
                rl_end_date=None,
                rl_start_date=self.now,
                airframe=self.airframe2,
            )
        )
        self.readiness_levels.append(
            test_create_readiness_level(
                dodid=self.soldiers[3],
                readiness_level="2",
                rl_end_date=None,
                rl_start_date=self.now,
                airframe=self.airframe2,
            )
        )
        self.readiness_levels.append(
            test_create_readiness_level(
                dodid=self.soldiers[4],
                readiness_level="3",
                rl_end_date=self.now - timedelta(weeks=1),
                rl_start_date=self.now,
                airframe=self.airframe,
            )
        )

        # Create User for authentication
        self.user = create_test_user(unit=self.first_units[0], is_admin=True)

        self.second_units = Unit.objects.exclude(uic__in=self.first_uics)

        self.unit = Unit.objects.create(
            uic="TESTUIC", short_name="Test Unit", display_name="Test Unit Display", child_uics="TESTCHILD"
        )
        self.child_unit = create_single_test_unit(
            uic="TESTCHILD", short_name="Test Child Unit", display_name="Test Child Unit Display", parent_uic=self.unit
        )

        self.grade_rank1 = GradeRank.objects.create(code="E3", description="Private First Class")
        self.grade_rank2 = GradeRank.objects.create(code="E4", description="Specialist")
        self.grade_rank3 = GradeRank.objects.create(code="O1", description="Second Lieutenant")

        self.skill1 = Skill.objects.create(asi_code="AS123", description="Test Skill 1")
        self.skill2 = Skill.objects.create(asi_code="AS124", description="Test Skill 2")
        self.skill3 = Skill.objects.create(asi_code="AS987", description="Test Skill 3")

        self.mtoe1 = MTOE.objects.create(
            uic=self.unit,
            document_number="DOC123",
            fiscal_year=fy,
            change_number=1,
            major_army_command_codes="MACC",
            paragraph_no_1="01",
            paragraph_no_3="001",
            required_strength="2",
            authorized_strength="2",
            identity_code="ID",
            position_code="15P1O",
            army_mgmt_structure_code="AMSC",
            grade=self.grade_rank1,
            branch="BR",
            line_number="001",
            special_qualification_id="SQ1",
        )
        self.mtoe1.asi_codes.add(self.skill1)

        self.mtoe2 = MTOE.objects.create(
            uic=self.unit,
            document_number="DOC124",
            fiscal_year=fy,
            change_number=2,
            major_army_command_codes="MACC",
            paragraph_no_1="02",
            paragraph_no_3="002",
            required_strength="1",
            authorized_strength="1",
            identity_code="ID",
            position_code="15V2O",
            army_mgmt_structure_code="AMSC",
            grade=self.grade_rank2,
            branch="BR",
            line_number="002",
            special_qualification_id="SQ2",
        )
        self.mtoe2.asi_codes.add(self.skill2)

        # Position that doesn't require a particular ASI code
        self.mtoe3 = MTOE.objects.create(
            uic=self.unit,
            document_number="DOC125",
            fiscal_year=fy,
            change_number=3,
            major_army_command_codes="MACC",
            paragraph_no_1="03",
            paragraph_no_3="003",
            required_strength="1",
            authorized_strength="1",
            identity_code="ID",
            position_code="15F30",
            army_mgmt_structure_code="AMSC",
            grade=self.grade_rank3,
            branch="BR",
            line_number="003",
            special_qualification_id="SQ3",
        )

        self.mtoe_different_strengths = MTOE.objects.create(
            uic=self.child_unit,
            document_number="DOC126",
            fiscal_year=fy,
            change_number=4,
            major_army_command_codes="MACC",
            paragraph_no_1="04",
            paragraph_no_3="004",
            required_strength=5,
            authorized_strength=7,
            position_code="11B30",
        )

        self.soldier1 = create_single_test_soldier(
            dodid="1234567890", uic=self.unit, grade_rank=self.grade_rank1, mos="15P"
        )
        self.soldier1.asi_codes.add(self.skill1)

        self.soldier2 = create_single_test_soldier(
            dodid="0987654321", uic=self.unit, grade_rank=self.grade_rank2, mos="15P"
        )
        self.soldier2.asi_codes.add(self.skill2)

        self.soldier3 = create_single_test_soldier(
            dodid="1122334455", uic=self.unit, grade_rank=self.grade_rank3, mos="15V"
        )
        self.soldier3.asi_codes.add(self.skill3)

        for i in range(0, len(self.first_units)):
            if i % 3 == 0:
                create_single_test_mtoe(uic=self.first_units[i], position_code=f"123A{i}", grade=rank, fiscal_year=fy)
            else:
                create_single_test_mtoe(uic=self.first_units[i], position_code=f"15F4{i}", grade=rank, fiscal_year=fy)

        for i in range(0, len(self.second_units)):
            if i % 5 == 0:
                create_single_test_mtoe(uic=self.second_units[i], position_code=f"123A{i}", grade=rank, fiscal_year=fy)
            else:
                create_single_test_mtoe(uic=self.second_units[i], position_code=f"15F4{i}", grade=rank, fiscal_year=fy)

        self.client = TestClient(personnel_router, headers={"Auth-User": self.user.user_id})

        # This line will test the property on the model for MOS.
        self.mos_created = set([mtoe.mos for mtoe in MTOE.objects.all()])

    def test_authorized_crew(self):
        """
        Test the authorized crew endpoint.
        """
        response = self.client.get(f"/authorized-crew?uic={self.first_units[0].uic}")
        self.assertEqual(response.status_code, 200)
        for row in response.data:
            self.assertTrue(row["mos"] in self.mos_created)
        self.assertEqual(
            response.data,
            [
                {"mos": "346B", "num_authorized": 40},
                {"mos": "34A", "num_authorized": 20},
                {"mos": "15F", "num_authorized": 2},
                {"mos": "123A", "num_authorized": 2},
            ],
        )

        response = self.client.get(f"/authorized-crew?uic={self.second_units[0].uic}")
        self.assertEqual(response.status_code, 200)
        for row in response.data:
            self.assertTrue(row["mos"] in self.mos_created)
        self.assertEqual(
            response.data,
            [{"mos": "15F", "num_authorized": 3}, {"mos": "123A", "num_authorized": 1}],
        )

        response = self.client.get(f"/authorized-crew?uic={self.first_units[0].uic}&only_maintainers={True}")
        self.assertEqual(response.status_code, 200)
        for row in response.data:
            self.assertTrue(row["mos"] in self.mos_created)
        self.assertEqual(response.data, [{"mos": "15F", "num_authorized": 2}])

    def test_list_skills(self):
        """
        Test list skills endpoint.
        """
        response = self.client.get("/skills")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 13)

    def test_unit_skill_list(self):
        """
        Test skills list for a unit.
        """
        response = self.client.get(f"/skills?uic={self.first_units[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 10)
        response = self.client.get(f"/skills?uic={self.first_units[3].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 9)

    def test_crew_expr_rl(self):
        """
        Test base crew readiness endpoint.
        """
        expected = [
            {"model": "UH-60L", "count": 1, "rl_type": "NVG", "readiness_level": "1"},
            {"model": "UH-60L", "count": 1, "rl_type": "NVG", "readiness_level": "2"},
            {"model": "UH-60M", "count": 2, "rl_type": "NVG", "readiness_level": "2"},
        ]
        response = self.client.get(f"/crew-expr-rl?uic={self.first_units[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_crew_expr_rl_airframe(self):
        """
        Test crew readiness endpoint with airframe.
        """
        expected = [
            {"model": "UH-60L", "count": 1, "rl_type": "NVG", "readiness_level": "1"},
            {"model": "UH-60L", "count": 1, "rl_type": "NVG", "readiness_level": "2"},
        ]
        expected2 = [{"model": "UH-60M", "count": 2, "rl_type": "NVG", "readiness_level": "2"}]
        response = self.client.get(f"/crew-expr-rl?uic={self.first_units[0].uic}&models=UH-60L")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

        response = self.client.get(f"/crew-expr-rl?uic={self.first_units[0].uic}&models=UH-60M")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected2)

        response = self.client.get(f"/crew-expr-rl?uic={self.first_units[0].uic}&models=UH-60M&models=UH-60L")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected + expected2)

    def test_crew_skill(self):
        """
        Test crew skill endpoint.
        """
        expected = [
            {
                "model": "UH-60M",
                "actual_skills": [
                    {"skill": "ASI1", "count": 4},
                    {"skill": "ASI10", "count": 4},
                    {"skill": "ASI2", "count": 4},
                    {"skill": "ASI3", "count": 4},
                    {"skill": "ASI4", "count": 5},
                    {"skill": "ASI5", "count": 5},
                    {"skill": "ASI6", "count": 5},
                    {"skill": "ASI7", "count": 5},
                    {"skill": "ASI8", "count": 5},
                    {"skill": "ASI9", "count": 5},
                ],
                "authorized_skills": [
                    {"skill": "ASI1", "count": 15},
                    {"skill": "ASI10", "count": 10},
                    {"skill": "ASI2", "count": 15},
                    {"skill": "ASI3", "count": 15},
                    {"skill": "ASI4", "count": 15},
                    {"skill": "ASI5", "count": 15},
                    {"skill": "ASI6", "count": 15},
                    {"skill": "ASI7", "count": 15},
                    {"skill": "ASI8", "count": 15},
                    {"skill": "ASI9", "count": 15},
                ],
            },
            {
                "model": "UH-60L",
                "actual_skills": [
                    {"skill": "ASI1", "count": 4},
                    {"skill": "ASI10", "count": 4},
                    {"skill": "ASI2", "count": 4},
                    {"skill": "ASI3", "count": 4},
                    {"skill": "ASI4", "count": 5},
                    {"skill": "ASI5", "count": 5},
                    {"skill": "ASI6", "count": 5},
                    {"skill": "ASI7", "count": 5},
                    {"skill": "ASI8", "count": 5},
                    {"skill": "ASI9", "count": 5},
                ],
                "authorized_skills": [
                    {"skill": "ASI1", "count": 15},
                    {"skill": "ASI10", "count": 10},
                    {"skill": "ASI2", "count": 15},
                    {"skill": "ASI3", "count": 15},
                    {"skill": "ASI4", "count": 15},
                    {"skill": "ASI5", "count": 15},
                    {"skill": "ASI6", "count": 15},
                    {"skill": "ASI7", "count": 15},
                    {"skill": "ASI8", "count": 15},
                    {"skill": "ASI9", "count": 15},
                ],
            },
        ]
        response = self.client.get(f"/crew-expr-skill?uic={self.first_units[0].uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_crew_skill_filters(self):
        """
        Test crew skill endpoint with filters.
        """
        expected = [
            {
                "model": "UH-60M",
                "actual_skills": [
                    {"skill": "ASI1", "count": 4},
                    {"skill": "ASI10", "count": 4},
                    {"skill": "ASI2", "count": 4},
                    {"skill": "ASI3", "count": 4},
                    {"skill": "ASI4", "count": 5},
                    {"skill": "ASI5", "count": 5},
                    {"skill": "ASI6", "count": 5},
                    {"skill": "ASI7", "count": 5},
                    {"skill": "ASI8", "count": 5},
                    {"skill": "ASI9", "count": 5},
                ],
                "authorized_skills": [
                    {"skill": "ASI1", "count": 15},
                    {"skill": "ASI10", "count": 10},
                    {"skill": "ASI2", "count": 15},
                    {"skill": "ASI3", "count": 15},
                    {"skill": "ASI4", "count": 15},
                    {"skill": "ASI5", "count": 15},
                    {"skill": "ASI6", "count": 15},
                    {"skill": "ASI7", "count": 15},
                    {"skill": "ASI8", "count": 15},
                    {"skill": "ASI9", "count": 15},
                ],
            }
        ]
        expected2 = [
            {
                "model": "UH-60L",
                "actual_skills": [
                    {"skill": "ASI1", "count": 4},
                    {"skill": "ASI10", "count": 4},
                    {"skill": "ASI2", "count": 4},
                    {"skill": "ASI3", "count": 4},
                    {"skill": "ASI4", "count": 5},
                    {"skill": "ASI5", "count": 5},
                    {"skill": "ASI6", "count": 5},
                    {"skill": "ASI7", "count": 5},
                    {"skill": "ASI8", "count": 5},
                    {"skill": "ASI9", "count": 5},
                ],
                "authorized_skills": [
                    {"skill": "ASI1", "count": 15},
                    {"skill": "ASI10", "count": 10},
                    {"skill": "ASI2", "count": 15},
                    {"skill": "ASI3", "count": 15},
                    {"skill": "ASI4", "count": 15},
                    {"skill": "ASI5", "count": 15},
                    {"skill": "ASI6", "count": 15},
                    {"skill": "ASI7", "count": 15},
                    {"skill": "ASI8", "count": 15},
                    {"skill": "ASI9", "count": 15},
                ],
            }
        ]
        expected3 = [
            {
                "model": "UH-60M",
                "actual_skills": [
                    {"skill": "ASI1", "count": 4},
                    {"skill": "ASI5", "count": 5},
                    {"skill": "ASI8", "count": 5},
                ],
                "authorized_skills": [
                    {"skill": "ASI1", "count": 15},
                    {"skill": "ASI5", "count": 15},
                    {"skill": "ASI8", "count": 15},
                ],
            },
            {
                "model": "UH-60L",
                "actual_skills": [
                    {"skill": "ASI1", "count": 4},
                    {"skill": "ASI5", "count": 5},
                    {"skill": "ASI8", "count": 5},
                ],
                "authorized_skills": [
                    {"skill": "ASI1", "count": 15},
                    {"skill": "ASI5", "count": 15},
                    {"skill": "ASI8", "count": 15},
                ],
            },
        ]
        expected4 = [
            {
                "model": "UH-60L",
                "actual_skills": [
                    {"skill": "ASI1", "count": 4},
                    {"skill": "ASI5", "count": 5},
                    {"skill": "ASI8", "count": 5},
                ],
                "authorized_skills": [
                    {"skill": "ASI1", "count": 15},
                    {"skill": "ASI5", "count": 15},
                    {"skill": "ASI8", "count": 15},
                ],
            },
        ]
        response = self.client.get(f"/crew-expr-skill?uic={self.first_units[0].uic}&models=UH-60M")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)
        response = self.client.get(f"/crew-expr-skill?uic={self.first_units[0].uic}&models=UH-60L")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected2)
        response = self.client.get(
            f"/crew-expr-skill?uic={self.first_units[0].uic}&skills=ASI1&skills=ASI5&skills=ASI8"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected3)
        response = self.client.get(
            f"/crew-expr-skill?uic={self.first_units[0].uic}&skills=ASI1&skills=ASI5&skills=ASI8&models=UH-60L"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected4)

    def test_crew_strength_mos(self):
        """
        Test crew strength by MOS with complete data
        """
        response = self.client.get("/crew-strength-mos?uic=TESTUIC")
        self.assertEqual(response.status_code, 200)

        expected_data = [
            {"mos": "11B", "rank": "UNKNOWN", "actual_count": 0, "num_authorized": 5},
            {"mos": "123A", "rank": "E1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15F", "rank": "E1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15P", "rank": "E3", "actual_count": 1, "num_authorized": 2},
            {"mos": "15V", "rank": "E4", "actual_count": 0, "num_authorized": 1},
            {"mos": "15F", "rank": "O1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15P", "rank": "E4", "actual_count": 1, "num_authorized": 0},
            {"mos": "15V", "rank": "O1", "actual_count": 1, "num_authorized": 0},
        ]

        self.assertEqual(response.json(), expected_data)

    def test_crew_strength_mos_no_data(self):
        """
        Test crew strength by MOS when no data is available for a unit
        """
        response = self.client.get("/crew-strength-mos?uic=NODATA")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Not Found"})

    def test_crew_strength_mos_partial_data(self):
        """
        Test crew strength by MOS when some soldiers are missing
        """
        # Remove a soldier to simulate partial data
        Soldier.objects.filter(dodid="1234567890").delete()

        response = self.client.get("/crew-strength-mos?uic=TESTUIC")
        self.assertEqual(response.status_code, 200)
        expected_data = [
            {"mos": "11B", "rank": "UNKNOWN", "actual_count": 0, "num_authorized": 5},
            {"mos": "123A", "rank": "E1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15F", "rank": "E1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15P", "rank": "E3", "actual_count": 0, "num_authorized": 2},
            {"mos": "15V", "rank": "E4", "actual_count": 0, "num_authorized": 1},
            {"mos": "15F", "rank": "O1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15P", "rank": "E4", "actual_count": 1, "num_authorized": 0},
            {"mos": "15V", "rank": "O1", "actual_count": 1, "num_authorized": 0},
        ]
        self.assertEqual(response.json(), expected_data)

    def test_crew_strength_mos_enlisted_only(self):
        response = self.client.get("/crew-strength-mos?uic=TESTUIC&filter_enlisted=true")
        self.assertEqual(response.status_code, 200)
        expected_data = [
            {"mos": "11B", "rank": "UNKNOWN", "actual_count": 0, "num_authorized": 5},
            {"mos": "123A", "rank": "E1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15F", "rank": "E1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15P", "rank": "E3", "actual_count": 1, "num_authorized": 2},
            {"mos": "15V", "rank": "E4", "actual_count": 0, "num_authorized": 1},
            {"mos": "15F", "rank": "O1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15P", "rank": "E4", "actual_count": 1, "num_authorized": 0},
        ]
        self.assertEqual(response.json(), expected_data)

    def test_crew_strength_mos_different_strengths(self):
        """
        Test crew strength by MOS when required and authorized strengths differ
        """
        response = self.client.get("/crew-strength-mos?uic=TESTUIC")
        self.assertEqual(response.status_code, 200)

        expected_data = [
            {"mos": "11B", "rank": "UNKNOWN", "actual_count": 0, "num_authorized": 5},
            {"mos": "123A", "rank": "E1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15F", "rank": "E1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15P", "rank": "E3", "actual_count": 1, "num_authorized": 2},
            {"mos": "15V", "rank": "E4", "actual_count": 0, "num_authorized": 1},
            {"mos": "15F", "rank": "O1", "actual_count": 0, "num_authorized": 1},
            {"mos": "15P", "rank": "E4", "actual_count": 1, "num_authorized": 0},
            {"mos": "15V", "rank": "O1", "actual_count": 1, "num_authorized": 0},
        ]
        self.assertEqual(response.json(), expected_data)

    def test_crew_strength_skill(self):
        """
        Test crew strength by Skill with complete data
        """
        response = self.client.get("/crew-strength-skill?uic=TESTUIC")
        self.assertEqual(response.status_code, 200)

        expected_data = [
            {"rank": "E3", "skill": "AS123", "num_authorized": 2, "actual_count": 1},
            {"rank": "E4", "skill": "AS124", "num_authorized": 1, "actual_count": 1},
            {"rank": "O1", "skill": "AS987", "actual_count": 1, "num_authorized": 0},
        ]

        self.assertEqual(response.json(), expected_data)

    def test_crew_strength_skill_no_data(self):
        """
        Test crew strength by SKill when no data is available for a unit
        """
        response = self.client.get("/crew-strength-skill?uic=NODATA")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Not Found"})

    def test_crew_strength_skill_partial_data(self):
        """
        Test crew strength by Skill when some soldiers are missing
        """
        # Remove a soldier to simulate partial data
        Soldier.objects.filter(dodid="1234567890").delete()

        response = self.client.get("/crew-strength-skill?uic=TESTUIC")
        self.assertEqual(response.status_code, 200)
        expected_data = [
            {"rank": "E3", "skill": "AS123", "num_authorized": 2, "actual_count": 0},
            {"rank": "E4", "skill": "AS124", "num_authorized": 1, "actual_count": 1},
            {"rank": "O1", "skill": "AS987", "actual_count": 1, "num_authorized": 0},
        ]
        self.assertEqual(response.json(), expected_data)

    def test_crew_strength_skill_enlisted_only(self):
        response = self.client.get("/crew-strength-skill?uic=TESTUIC&filter_enlisted=true")
        self.assertEqual(response.status_code, 200)
        expected_data = [
            {"rank": "E3", "skill": "AS123", "num_authorized": 2, "actual_count": 1},
            {"rank": "E4", "skill": "AS124", "num_authorized": 1, "actual_count": 1},
        ]
        self.assertEqual(response.json(), expected_data)
