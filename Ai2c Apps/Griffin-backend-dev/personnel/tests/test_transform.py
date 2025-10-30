from django.test import RequestFactory, TransactionTestCase, override_settings, tag
from django.utils import timezone

from auto_dsr.models import RawSyncTimestamp
from personnel.models import MTOE, RAWReadinessLevel, RAWSkill, ReadinessLevel
from personnel.views.transforms import (
    transform_mtoe,
    transform_readiness_level,
    transform_readiness_skill,
    transform_skills,
)
from utils.tests import (
    create_n_skills,
    create_raw_readiness_skill,
    create_single_test_airframe,
    create_single_test_mtoe,
    create_single_test_raw_mtoe,
    create_single_test_unit,
    create_soldier,
    test_create_grades,
)
from utils.tests.test_readiness_creation import test_create_raw_readiness_level, test_create_readiness_level
from utils.transform.transform_utility import copy_from_raw


@tag("personnel_transform")
class PersonnelTransformTest(TransactionTestCase):
    def setUp(self):
        # Units
        self.unit = create_single_test_unit()
        self.unit2 = create_single_test_unit(uic="ZZ-1234567")
        self.unit3 = create_single_test_unit(uic="YY-123456")
        self.skills = create_n_skills(10, prefix="O")
        self.skills.append(create_n_skills(10, prefix="E"))
        self.grades = test_create_grades()
        self.airframe = create_single_test_airframe(mds="UH-60M", model="UH-60M")
        self.airframe2 = create_single_test_airframe(mds="UH-60L", model="UH-60L")
        self.airframe3 = create_single_test_airframe(mds="AH-64D", model="AH-64D")
        self.now = timezone.now()
        self.now_format = self.now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

        # MTOE Stock
        self.raw_mtoe = []
        self.mtoe = create_single_test_mtoe(uic=self.unit, asi_skills=[self.skills[0]], grade=self.grades[0])
        self.raw_mtoe.append(
            create_single_test_raw_mtoe(
                uic=self.unit.uic, grade="E6", asi01=self.skills[0].asi_code, asi02=None, asi03=None, asi04=None
            )
        )
        self.raw_mtoe.append(
            create_single_test_raw_mtoe(
                uic=self.unit2.uic,
                asi01=self.skills[1].asi_code[1:],
                asi02=self.skills[2].asi_code[1:],
                asi03=self.skills[3].asi_code[1:],
                asi04=self.skills[4].asi_code[1:],
            )
        )
        self.raw_mtoe.append(
            create_single_test_raw_mtoe(
                uic="YY-1234567",
                asi01=self.skills[6].asi_code[1:],
                asi02=self.skills[7].asi_code[1:],
                asi03=self.skills[8].asi_code[1:],
                asi04=self.skills[3].asi_code[1:],
            )
        )
        self.raw_mtoe.append(
            create_single_test_raw_mtoe(
                uic=self.unit2.uic,
                position_code="45DEF",
                fiscal_year=24,
                grade="GM",
                asi01=self.skills[5].asi_code[1:],
                asi02=self.skills[0].asi_code[1:],
                asi03=self.skills[6].asi_code[1:],
                asi04=self.skills[8].asi_code[1:],
            )
        )

        self.raw_mtoe.append(
            create_single_test_raw_mtoe(
                uic=self.unit2.uic,
                position_code="8675309",
                fiscal_year=25,
                grade="GM",
                asi01="5P",
                asi02=self.skills[2].asi_code[1:],
                asi03=self.skills[3].asi_code[1:],
                asi04=self.skills[4].asi_code[1:],
            )
        )

        # Readiness objects
        self.raw_readiness = []
        self.raw_readiness.append(
            create_raw_readiness_skill(
                uic=self.unit.uic, asi_codes=[self.skills[1].asi_code, self.skills[2].asi_code, self.skills[3].asi_code]
            )
        )
        self.raw_readiness.append(
            create_raw_readiness_skill(
                uic=self.unit2.uic,
                dodid="98765432",
                asi_codes=[self.skills[4].asi_code, self.skills[5].asi_code, self.skills[6].asi_code],
            )
        )
        self.raw_readiness.append(
            create_raw_readiness_skill(
                uic="YY-1234567",
                dodid="1239876",
                asi_codes=[self.skills[1].asi_code, self.skills[2].asi_code, self.skills[3].asi_code],
            )
        )
        self.readiness = create_soldier(uic=self.unit)

        self.readiness_level = test_create_readiness_level(
            dodid=self.readiness,
            readiness_level="2",
            rl_end_date=self.now,
            rl_start_date=self.now,
            airframe=self.airframe,
        )
        self.raw_readiness_level = test_create_raw_readiness_level(
            dodid=self.readiness.dodid,
            readiness_level="1",
            rl_end_date=self.now,
            rl_start_date=self.now,
            airframe=self.airframe.mds,
        )
        self.raw_readiness_level2 = test_create_raw_readiness_level(
            dodid=self.readiness.dodid, airframe=self.airframe2.mds
        )
        self.raw_readiness_level3 = test_create_raw_readiness_level(dodid=self.readiness.dodid, airframe="AB-123")
        self.factory = RequestFactory()

    @override_settings(DISABLE_TRANSACTION_ATOMIC_BLOCKS=True)
    def test_mtoe_translation(self):
        request = self.factory.get("/some-path/")
        response = transform_mtoe(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 4 of 5 records, 1 skipped, 0 failed.")
        # Test to make sure two records exist
        self.assertEqual(MTOE.objects.all().count(), 4)
        # Make sure the new item was created
        self.assertEqual(MTOE.objects.filter(uic="ZZ-1234567").count(), 3)
        # Make sure the non existent UIC was not created
        self.assertEqual(MTOE.objects.filter(uic="YY-1234567").count(), 0)
        # Make sure the existing item was updated
        self.assertEqual(MTOE.objects.get(uic=self.unit.uic).grade.code, "E6")
        for asi_code in MTOE.objects.get(uic=self.unit.uic).asi_codes.values_list("asi_code", flat=True):
            self.assertEqual(asi_code, self.skills[0].asi_code)

    @override_settings(DISABLE_TRANSACTION_ATOMIC_BLOCKS=True)
    def test_mtoe_translation_filter(self):
        request = self.factory.get("/some-path?fiscal_year=24")
        response = transform_mtoe(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 1 of 5 records, 4 skipped, 0 failed.")
        # Test to make sure two records exist
        self.assertEqual(MTOE.objects.all().count(), 2)
        # Make sure the new item was created
        self.assertEqual(MTOE.objects.filter(uic="ZZ-1234567").count(), 1)
        # Make sure the non existent UIC was not created
        self.assertEqual(MTOE.objects.filter(uic="YY-1234567").count(), 0)

    @override_settings(DISABLE_TRANSACTION_ATOMIC_BLOCKS=True)
    def test_skill_translation(self):
        for i in range(1, 100):
            RAWSkill.objects.create(asi_code=f"CD{i}", text_description=f"Test Code {i}")

        for i in range(1, 10):
            RAWSkill.objects.create(asi_code=f"ASI{i}", text_description=f"ASI Update Skill Code {i}")

        request = self.factory.get("/some-path")
        response = transform_skills(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 108 of 108 records, 0 skipped, 0 failed.")

    @override_settings(DISABLE_TRANSACTION_ATOMIC_BLOCKS=True)
    def test_readiness_skill_translation(self):
        request = self.factory.get("/some-path")
        response = transform_readiness_skill(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 2 of 3 records, 1 skipped, 0 failed.")

    @override_settings(DISABLE_TRANSACTION_ATOMIC_BLOCKS=True)
    def test_readiness_level_translation(self):
        request = self.factory.get("/some-path")
        response = transform_readiness_level(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 2 of 3 records, 0 skipped, 1 failed.")
        # Test to make sure two records exist
        self.assertEqual(ReadinessLevel.objects.all().count(), 2)
        # Make sure the new item was created
        self.assertEqual(ReadinessLevel.objects.filter(airframe=self.airframe2).count(), 1)
        # Test Update record
        self.assertEqual(ReadinessLevel.objects.filter(airframe=self.airframe)[0].readiness_level, "1")

    @override_settings(DISABLE_TRANSACTION_ATOMIC_BLOCKS=True)
    def test_rl_translation_with_sync(self):
        mappings = [{"acft_mds": "aircraft.Airframe.mds:airframe", "dodid": "personnel.Soldier.dodid:dodid"}]
        unique_fields = ["dodid", "acft_mds", "rl_type"]
        excludes = ["id"]
        copy_from_raw(
            RAWReadinessLevel,
            ReadinessLevel,
            mapping=mappings,
            unique_fields=unique_fields,
            exclude=excludes,
            sync_datetime=self.now,
            sync_timestamp=True,
        )
        # Test to make sure two records exist
        self.assertEqual(ReadinessLevel.objects.all().count(), 2)
        self.assertEqual(RawSyncTimestamp.objects.filter(table="raw_readiness_level").count(), 1)
        self.assertEqual(RawSyncTimestamp.objects.filter(table="raw_readiness_level")[0].most_recent_sync, self.now)
