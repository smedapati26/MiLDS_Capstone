from django.test import RequestFactory, TransactionTestCase, override_settings, tag
from django.utils import timezone

from personnel.models import MTOE, RAWSkill
from personnel.utils.transform.transform_utility import copy_from_raw
from personnel.views.transforms import transform_mtoe, transform_skills
from utils.tests import create_n_skills, create_single_test_mtoe, create_single_test_raw_mtoe
from utils.tests.unit import create_testing_unit


@tag("personnel_transform")
class PersonnelTransformTest(TransactionTestCase):
    def setUp(self):
        # Units
        self.unit = create_testing_unit()
        self.unit2 = create_testing_unit(uic="ZZ-1234567")
        self.unit3 = create_testing_unit(uic="YY-123456")
        self.skills = create_n_skills(10, prefix="O")
        self.skills.append(create_n_skills(10, prefix="E"))
        self.now = timezone.now()
        self.now_format = self.now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

        # MTOE Stock
        self.raw_mtoe = []
        self.mtoe = create_single_test_mtoe(uic=self.unit, asi_skills=[self.skills[0]])
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
        self.assertEqual(MTOE.objects.get(uic=self.unit.uic).grade, "SSG")
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
