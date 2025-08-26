from django.test import TestCase, tag
from django.urls import reverse

from utils.tests import create_test_units


@tag("unit")
class GetAllUnitsTestCase(TestCase):
    """
    A simple unit test class to get all units and all associated fields
    """

    @classmethod
    def setUp(self):
        self.units_created, self.uic_hierarchy = create_test_units()
        self.uics_created = [unit.uic for unit in self.units_created]

    def test_returns_all_units(self):
        """Checks all units created are returned"""
        url = reverse("get_all_units")

        response = self.client.get(url)
        unit_data = response.json()
        self.assertEqual(len(unit_data), len(self.units_created))
        returned_uics = [unit["uic"] for unit in unit_data]
        self.assertCountEqual(returned_uics, self.uics_created)

    def test_returns_all_fields(self):
        """Checks all fields returned by method"""
        url = reverse("get_all_units")

        response = self.client.get(url)
        unit_data = response.json()
        returned_fields = unit_data[0].keys()
        expected_fields = [
            "uic",
            "short_name",
            "display_name",
            "nick_name",
            "echelon",
            "parent_uic",
            "subordinate_uics",
        ]
        self.assertCountEqual(returned_fields, expected_fields)
