import json
from datetime import date
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.models import TaskForce, Unit
from utils.tests import create_single_test_unit, create_test_taskforce


@tag("unit")
class EditUnitTestCase(TestCase):
    """
    Test Suite for the Edit Unit API
    """

    def setUp(self):
        """
        Set up some initial data for the tests:

        - Create two units: one that's a Task Force and one that's not.
        - The Task Force unit has an associated TaskForce model instance with start_date and end_date.
        """

        # Not a Task Force unit
        self.unit = create_single_test_unit(
            uic="XX-123457",
            display_name="NonTFDisplay",
            short_name="NonTFShort",
            echelon="BN",
        )

        # Task Force unit
        self.tf_unit = create_single_test_unit(
            uic="TF-123458",
            display_name="TFDisplay",
            short_name="TFShort",
            echelon="BN",
        )

        self.tf = create_test_taskforce(uic=self.tf_unit)

    def test_edit_non_taskforce_unit(self):
        """
        Test editing a unit that's not a Task Force:

        - Doesn't require `start_date` and `end_date`.
        - Ensures the uniqueness of `short_name` and `display_name`.
        """

        # Change the `short_name` and `display_name`
        data = {
            "display_name": "NewNonTFDisplay",
            "short_name": "NewNonTFShort",
        }
        url = reverse("edit_unit", args=[self.unit.uic])
        response = self.client.put(url, json.dumps(data))
        self.assertEqual(response.status_code, 200)

        # Check if changes were saved
        self.unit.refresh_from_db()
        self.assertEqual(self.unit.display_name, data["display_name"])
        self.assertEqual(self.unit.short_name, data["short_name"])

    def test_edit_unit_add_nick_name(self):
        """
        Test editing a unit to add a nick_name:
        """
        # Change the `short_name` and `display_name`
        data = {"display_name": "NewNonTFDisplay", "short_name": "NewNonTFShort", "nick_name": "Boomers"}
        url = reverse("edit_unit", args=[self.unit.uic])
        response = self.client.put(url, json.dumps(data))
        self.assertEqual(response.status_code, 200)

        # Check if changes were saved
        self.unit.refresh_from_db()
        self.assertEqual(self.unit.display_name, data["display_name"])
        self.assertEqual(self.unit.short_name, data["short_name"])
        self.assertEqual(self.unit.nick_name, data["nick_name"])

    def test_edit_taskforce_unit_without_dates(self):
        """
        Test editing a Task Force unit without providing `start_date` and `end_date`:
        - Should return a 400 Bad Request.
        """

        data = {
            "display_name": "NewTFDisplay",
        }
        url = reverse("edit_unit", args=[self.tf_unit.uic])
        response = self.client.put(url, json.dumps(data))
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_edit_taskforce_unit_with_dates(self):
        """
        Test editing a Task Force unit providing `start_date` and `end_date`:
        - Should save the changes.
        """

        data = {
            "display_name": "NewTFDisplay",
            "start_date": "2023-09-01",
            "end_date": "2024-01-01",
        }
        url = reverse("edit_unit", args=[self.tf_unit.uic])
        response = self.client.put(url, json.dumps(data))
        self.assertEqual(response.status_code, 200)

        # Check if changes were saved
        self.tf_unit.refresh_from_db()
        self.tf.refresh_from_db()
        self.assertEqual(self.tf_unit.display_name, data["display_name"])
        self.assertEqual(self.tf.start_date.isoformat(), data["start_date"])
        self.assertEqual(self.tf.end_date.isoformat(), data["end_date"])

    def test_edit_taskforce_unit_with_readiness_unit(self):
        """
        Test editing a Task Force unit providing `readiness_uic`:
        - Should save the changes.
        """
        readiness_unit = Unit.objects.create(
            uic="RDYUNIT",
            display_name="Readiness Unit",
            short_name="Readiness Unit",
            echelon="BN",
        )

        data = {
            "readiness_uic": readiness_unit.uic,
            "start_date": "2023-09-01",
            "end_date": "2024-01-01",
        }
        url = reverse("edit_unit", args=[self.tf_unit.uic])
        response = self.client.put(url, json.dumps(data))

        self.assertEqual(response.status_code, 200)

        # Check if changes were saved
        self.tf.refresh_from_db()
        self.assertEqual(self.tf.readiness_uic.uic, readiness_unit.uic)

    def test_ensure_unique_shortname_displayname(self):
        """
        Test the uniqueness checks for `short_name` and `display_name`:
        - Attempt to edit the Task Force unit with conflicting `short_name` and `display_name` values.
        - Should return a 400 Bad Request.
        """
        # Use `short_name` and `display_name` from the non-Task Force unit
        data = {
            "short_name": "NonTFShort",
            "display_name": "NonTFDisplay",
            "start_date": "2023-09-01",
            "end_date": "2024-01-01",
        }
        url = reverse("edit_unit", args=[self.tf_unit.uic])
        response = self.client.put(url, json.dumps(data))
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_actual_update_of_taskforce_dates(self):
        """
        Verify that the start_date and end_date in the TaskForce model are updated correctly.
        """
        data = {
            "display_name": "NewTFDisplay2",
            "start_date": "2023-10-01",
            "end_date": "2024-02-01",
        }
        url = reverse("edit_unit", args=[self.tf_unit.uic])
        response = self.client.put(url, json.dumps(data))
        self.assertEqual(response.status_code, 200)

        # Fetch the related TaskForce and verify the date changes
        task_force = TaskForce.objects.get(uic=self.tf_unit)
        self.assertEqual(task_force.start_date, date(2023, 10, 1))
        self.assertEqual(task_force.end_date, date(2024, 2, 1))

    def test_edit_all_tf_fields(self):
        """
        Verify that all fields in a unit & task force can be updated
        """
        readiness_unit = Unit.objects.create(
            uic="RDYUNIT",
            display_name="Readiness Unit",
            short_name="Readiness Unit",
            echelon="BN",
        )

        data = {
            "display_name": "NewTFDisplay2",
            "short_name": "NewTFShort2",
            "nick_name": "NewTFNick2",
            "readiness_uic": readiness_unit.uic,
            "start_date": "2023-10-01",
            "end_date": "2024-02-01",
        }
        url = reverse("edit_unit", args=[self.tf_unit.uic])
        response = self.client.put(url, json.dumps(data))
        self.assertEqual(response.status_code, 200)

        # Check if changes were saved
        self.tf_unit.refresh_from_db()
        self.tf.refresh_from_db()
        self.assertEqual(self.tf_unit.display_name, data["display_name"])
        self.assertEqual(self.tf_unit.short_name, data["short_name"])
        self.assertEqual(self.tf_unit.nick_name, data["nick_name"])
        self.assertEqual(self.tf.readiness_uic.uic, readiness_unit.uic)
        self.assertEqual(self.tf.start_date, date(2023, 10, 1))
        self.assertEqual(self.tf.end_date, date(2024, 2, 1))
