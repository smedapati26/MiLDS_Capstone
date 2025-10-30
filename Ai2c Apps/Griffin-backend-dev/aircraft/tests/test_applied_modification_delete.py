from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.models import AppliedModification
from utils.http import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
)
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_applied_modification,
    create_single_test_modification,
    create_single_test_modification_category,
    create_test_units,
    get_default_top_unit,
)


@tag("aircraft", "delete", "applied_modification")
class DeleteAppliedModificationTest(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()
        self.aircraft = create_single_test_aircraft(self.unit)
        self.modification = create_single_test_modification("Wings")
        self.modification_category = create_single_test_modification_category(self.modification)
        self.applied_modification = create_single_test_applied_modification(self.modification, self.aircraft)

    def test_delete_applied_modification_with_invalid_modification(self):
        response = self.client.delete(
            reverse(
                "delete_applied_modification",
                kwargs={"name": "NOT" + self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)
        self.assertEqual(AppliedModification.objects.count(), 1)

    def test_delete_applied_modification_with_invalid_aircraft_serial(self):
        response = self.client.delete(
            reverse(
                "delete_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": "NOT" + self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)
        self.assertEqual(AppliedModification.objects.count(), 1)

    def test_delete_applied_modification_with_no_applied_modifications(self):
        self.applied_modification.delete()

        response = self.client.delete(
            reverse(
                "delete_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST)
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_delete_applied_modification_with_valid_delete(self):
        response = self.client.delete(
            reverse(
                "delete_applied_modification",
                kwargs={"name": self.modification.name, "aircraft_serial": self.aircraft.serial},
            )
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Applied Modification successfully deleted.")
        self.assertEqual(AppliedModification.objects.count(), 0)
