from django.test import TestCase, tag

from utils.tests import create_test_units


@tag("unit", "unit_uic_hiearchy_generation", "model")
class UnitUICHiearchyGenerationTests(TestCase):
    # Initial setup for Unit UIC Hiearchy Test Cases.
    # - creating the needed models
    def setUp(self):
        self.units, self.units_hierarchy = create_test_units()

        self.expected_values = {
            "TSUNFF": {
                "parent_uics": [],
                "children_uics": ["TEST000AA", "TEST001AA", "TEST002AA"],
                "subordinate_uics": [
                    "TEST000AA",
                    "TEST001AA",
                    "TEST002AA",
                    "TEST000A0",
                    "TEST000B0",
                    "TEST000C0",
                    "TEST001A0",
                    "TEST001B0",
                    "TEST001C0",
                    "TEST002A0",
                    "TEST002B0",
                    "TEST002C0",
                ],
            },
            "TEST000AA": {
                "parent_uics": ["TSUNFF"],
                "children_uics": ["TEST000A0", "TEST000B0", "TEST000C0"],
                "subordinate_uics": ["TEST000A0", "TEST000B0", "TEST000C0"],
            },
            "TEST001AA": {
                "parent_uics": ["TSUNFF"],
                "children_uics": ["TEST001A0", "TEST001B0", "TEST001C0"],
                "subordinate_uics": ["TEST001A0", "TEST001B0", "TEST001C0"],
            },
            "TEST002AA": {
                "parent_uics": ["TSUNFF"],
                "children_uics": ["TEST002A0", "TEST002B0", "TEST002C0"],
                "subordinate_uics": ["TEST002A0", "TEST002B0", "TEST002C0"],
            },
            "TEST000A0": {
                "parent_uics": ["TEST000AA", "TSUNFF"],
                "children_uics": [],
                "subordinate_uics": [],
            },
            "TEST000B0": {
                "parent_uics": ["TEST000AA", "TSUNFF"],
                "children_uics": [],
                "subordinate_uics": [],
            },
            "TEST000C0": {
                "parent_uics": ["TEST000AA", "TSUNFF"],
                "children_uics": [],
                "subordinate_uics": [],
            },
            "TEST001A0": {
                "parent_uics": ["TEST001AA", "TSUNFF"],
                "children_uics": [],
                "subordinate_uics": [],
            },
            "TEST001B0": {
                "parent_uics": ["TEST001AA", "TSUNFF"],
                "children_uics": [],
                "subordinate_uics": [],
            },
            "TEST001C0": {
                "parent_uics": ["TEST001AA", "TSUNFF"],
                "children_uics": [],
                "subordinate_uics": [],
            },
            "TEST002A0": {
                "parent_uics": ["TEST002AA", "TSUNFF"],
                "children_uics": [],
                "subordinate_uics": [],
            },
            "TEST002B0": {
                "parent_uics": ["TEST002AA", "TSUNFF"],
                "children_uics": [],
                "subordinate_uics": [],
            },
            "TEST002C0": {
                "parent_uics": ["TEST002AA", "TSUNFF"],
                "children_uics": [],
                "subordinate_uics": [],
            },
        }

    # Tests for generating a Unit's UIC hiearchy.
    def test_units_hierarchy_structure(self):
        for unit in self.units:
            unit.set_all_unit_lists()

            self.assertEqual(
                sorted(unit.parent_uics),
                sorted(self.expected_values[unit.uic]["parent_uics"]),
            )

            self.assertEqual(
                sorted(unit.child_uics),
                sorted(self.expected_values[unit.uic]["children_uics"]),
            )

            self.assertEqual(
                sorted(unit.subordinate_uics),
                sorted(self.expected_values[unit.uic]["subordinate_uics"]),
            )
