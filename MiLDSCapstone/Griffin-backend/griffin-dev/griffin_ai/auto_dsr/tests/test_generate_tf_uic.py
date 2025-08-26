from django.test import TestCase, tag

from auto_dsr.models import Unit
from auto_dsr.utils import generate_tf_uic


@tag("create")
class GenerateUICFunctionTest(TestCase):
    def test_uic_generation(self):
        # Test the basic structure of the UIC
        uic = generate_tf_uic()

        self.assertEqual(len(uic), 9)  # Check the length
        self.assertTrue(uic.startswith("TF-"))  # Check the prefix

        # Create some units and ensure uniqueness
        Unit.objects.create(uic="TF-000001")
        Unit.objects.create(uic="TF-000002")
        uic = generate_tf_uic()
        self.assertNotEqual(uic, "TF-000001")
        self.assertNotEqual(uic, "TF-000002")
        self.assertEqual(uic, "TF-000003")
