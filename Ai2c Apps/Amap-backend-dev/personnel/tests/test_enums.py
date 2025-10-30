from unittest import TestCase

from django.test import tag

from personnel.model_utils import MaintenanceLevel, MosCode, Rank


@tag("enums")
class EnumTestCase(TestCase):
    """Enum Test Cases"""

    maxDiff = None

    def setUp(self):
        self.error_value = "ERROR_VALUE"

    def test_enum_has_value__success(self):
        mos = MosCode.has_value(MosCode.B)
        self.assertTrue(mos)

        rank = Rank.has_value(Rank.CPT)
        self.assertTrue(rank)

        maintenance_level = MaintenanceLevel.has_value(MaintenanceLevel.ML0)
        self.assertTrue(maintenance_level)

    def test_enum_has_value__fail_bool(self):
        mos = MosCode.has_value(self.error_value)
        self.assertFalse(mos)

        rank = Rank.has_value(self.error_value)
        self.assertFalse(rank)

        maintenance_level = MaintenanceLevel.has_value(self.error_value)
        self.assertFalse(maintenance_level)

    def test_enum_has_value__fail_error_message(self):
        error = MosCode.has_value(self.error_value, return_error=True)
        self.assertEqual(f"{self.error_value} not found in MOS Codes", error)

        error = Rank.has_value(self.error_value, return_error=True)
        self.assertEqual(f"{self.error_value} not found in Ranks", error)

        error = MaintenanceLevel.has_value(self.error_value, return_error=True)
        self.assertEqual(f"{self.error_value} not found in Maintainer Levels", error)
