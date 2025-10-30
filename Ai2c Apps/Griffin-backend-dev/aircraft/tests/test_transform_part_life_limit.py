from django.test import RequestFactory, TransactionTestCase, tag

from aircraft.models import LCF_341_01_LifeLimit
from aircraft.views.transforms import transform_part_life_limit
from utils.tests import create_single_test_part_life_limit, create_single_test_raw_part_life_limit


@tag("part_life_limit_transformation")
class PartLifeLimitTransformationTest(TransactionTestCase):
    def setUp(self):
        # Units
        part_life = create_single_test_part_life_limit()
        raw_part_life = []
        raw_part_life.append(create_single_test_raw_part_life_limit(maot=242))
        raw_part_life.append(
            create_single_test_raw_part_life_limit(part_number="9-9999999-99", maot=9654, component_type="CC")
        )
        raw_part_life.append(
            create_single_test_raw_part_life_limit(part_number="88-888888-88", maot=12345, component_type="RC")
        )

        self.factory = RequestFactory()

    def test_fault_translation(self):
        request = self.factory.get("/some-path/")
        response = transform_part_life_limit(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Transformed 3 of 3 records, 0 skipped, 0 failed.")
        self.assertEqual(LCF_341_01_LifeLimit.objects.all().count(), 3)
