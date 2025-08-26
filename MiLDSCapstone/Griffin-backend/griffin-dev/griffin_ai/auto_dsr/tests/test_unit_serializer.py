from django.test import TestCase, tag

from auto_dsr.models import Unit
from auto_dsr.serializers import UnitSerializer


@tag("create")
class UnitSerializerTestCase(TestCase):
    """
    Test suite for the `UnitSerializer` class.

    This class ensures correct serialization and validation logic for the UnitSerializer.
    The tests focus on the unique constraints for 'short_name' and 'display_name' fields.
    """

    def setUp(self):
        # This will be our reference data for testing
        self.unit_data = {
            "uic": "TF-012345",
            "display_name": "DisplayTest",
            "short_name": "ShortTest",
            "echelon": "BN",
            "start_date": "2023-08-07",
        }

        self.sub_unit_data = {
            "uic": "TF-012346",
            "display_name": "DisplayTestSub",
            "short_name": "ShortTestSub",
            "echelon": "CO",
            "parent_uic": "TF-012345",
            "start_date": "2023-08-07",
            "end_date": "2023-09-24",
        }

    def test_duplicate_uics(self):
        # Create a unit using the serializer
        serializer = UnitSerializer(data=self.unit_data)

        if not serializer.is_valid():
            print("Initial Serializer Errors:", serializer.errors)

        self.assertTrue(serializer.is_valid())
        serializer.save()

        # Test conflict with uic
        conflict_data = self.unit_data.copy()
        conflict_data["short_name"] = "AnotherShortTest"
        conflict_data["display_name"] = "AnotherDisplay"
        conflict_data["uic"] = "TF-012345"  # Same UIC
        conflict_serializer = UnitSerializer(data=conflict_data)
        self.assertFalse(conflict_serializer.is_valid())
        self.assertIn("uic", conflict_serializer.errors)

    def test_duplicate_short_name(self):
        # Create a unit using the serializer
        serializer = UnitSerializer(data=self.unit_data)

        if not serializer.is_valid():
            print("Initial Serializer Errors:", serializer.errors)

        self.assertTrue(serializer.is_valid())
        serializer.save()

        # Test conflict with short_name
        conflict_data = self.unit_data.copy()
        conflict_data["short_name"] = "ShortTest"  # same as the original
        conflict_data["display_name"] = "AnotherDisplay"
        conflict_data["uic"] = "TF-012347"  # a new UIC for differentiation
        conflict_serializer = UnitSerializer(data=conflict_data)
        self.assertFalse(conflict_serializer.is_valid())
        self.assertIn("short_name", conflict_serializer.errors)

    def test_duplicate_display_name(self):
        # Create a unit using the serializer
        serializer = UnitSerializer(data=self.unit_data)

        if not serializer.is_valid():
            print("Initial Serializer Errors:", serializer.errors)

        self.assertTrue(serializer.is_valid())
        serializer.save()

        # Test conflict with display_name
        conflict_data = self.unit_data.copy()
        conflict_data["short_name"] = "AnotherShort"
        conflict_data["display_name"] = "DisplayTest"  # same as the original
        conflict_data["uic"] = "TF-012348"  # a new UIC for differentiation
        conflict_serializer = UnitSerializer(data=conflict_data)
        self.assertFalse(conflict_serializer.is_valid())
        self.assertIn("display_name", conflict_serializer.errors)

    def test_unique_unit_names(self):
        # Create a unit using the serializer
        serializer = UnitSerializer(data=self.unit_data)

        if not serializer.is_valid():
            print("Initial Serializer Errors:", serializer.errors)

        self.assertTrue(serializer.is_valid())
        serializer.save()
        # Test with a different short_name and display_name
        different_data = self.unit_data.copy()
        different_data["short_name"] = "AnotherShort"
        different_data["display_name"] = "AnotherDisplay"
        different_data["uic"] = "TF-012349"  # a new UIC for differentiation
        different_serializer = UnitSerializer(data=different_data)
        self.assertTrue(different_serializer.is_valid())
        different_serializer.save()

    def test_creation_with_parent_uic(self):
        # Create higher headquarters unit using the serializer
        serializer = UnitSerializer(data=self.unit_data)

        if not serializer.is_valid():
            print("Initial Serializer Errors:", serializer.errors)

        self.assertTrue(serializer.is_valid())
        serializer.save()

        hhq = Unit.objects.get(uic=self.unit_data["uic"])

        # Create subordinate unit using the serializer
        serializer = UnitSerializer(data=self.sub_unit_data)

        if not serializer.is_valid():
            print("Initial Serializer Errors:", serializer.errors)  # print the errors if validation fails

        self.assertTrue(serializer.is_valid())
        serializer.save()

        sub_unit = Unit.objects.get(uic=self.sub_unit_data["uic"])

        self.assertEqual(sub_unit.parent_uic, hhq)
