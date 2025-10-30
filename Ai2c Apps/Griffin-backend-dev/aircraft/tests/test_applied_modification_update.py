import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.model_utils import EquipmentStatuses, ModificationTypes
from aircraft.models import AppliedModification
from utils.http import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_applied_modification,
    create_single_test_modification,
    create_single_test_modification_category,
    create_test_units,
    get_default_top_unit,
)


@tag("aircraft", "update", "applied_modification")
class UpdateAppliedModificationTest(TestCase):
    def setUp(self):
        create_test_units()
        self.unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(self.unit)

        self.modification = create_single_test_modification("Wings")
        self.category = create_single_test_modification_category(self.modification)
        self.applied_modification = create_single_test_applied_modification(self.modification, self.aircraft)
        self.applied_modification.other = "Other Data"
        self.applied_modification.save()

    def test_update_applied_modification_with_invalid_modification(self):
        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "New Other Data",
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": "NOT" + self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)
        self.assertEqual(self.applied_modification.other, "Other Data")

    def test_update_applied_modification_with_invalid_aircraft_serial_json(self):
        request_data = {
            "NOT" + "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "New Other Data",
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
        self.assertEqual(self.applied_modification.other, "Other Data")

    def test_update_applied_modification_with_invalid_aircraft_serial(self):
        request_data = {
            "aircraft_serial": "NOT" + self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "New Other Data",
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)
        self.assertEqual(self.applied_modification.other, "Other Data")

    def test_update_appiled_modification_with_no_applied_modifications(self):
        self.applied_modification.delete()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "New Other Data",
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST)
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_update_applied_modification_with_invaild_data_column_json(self):
        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "NOT" + "modification_key": "other",
            "modification_value": "New Other Data",
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
        self.assertEqual(self.applied_modification.other, "Other Data")

    def test_update_applied_modification_with_invalid_data_column_json(self):
        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "NOT" + "modification_value": "New Other Data",
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
        self.assertEqual(self.applied_modification.other, "Other Data")

    def test_update_applied_modification_with_non_category_modification(self):
        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "category",
            "modification_value": self.category.value,
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"), "Modification {} is not of type Category.".format(self.modification.name)
        )
        self.assertEqual(self.applied_modification.other, "Other Data")

    def test_update_applied_modification_with_invalid_modification_category(self):
        self.modification.type = ModificationTypes.CATEGORY
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "category",
            "modification_value": "NOT" + self.category.value,
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST)
        self.assertEqual(self.applied_modification.category, None)

    def test_update_applied_modification_with_invalid_install_data_type(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.INSTALL
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "installed",
            "modification_value": 51198,
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Data type of {} is not of type {}.".format(request_data["modification_value"], bool),
        )

    def test_update_applied_modification_with_invalid_count_data_type(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.COUNT
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "count",
            "modification_value": "Other Data",
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Data type of {} is not of type {}.".format(request_data["modification_value"], int),
        )

    def test_update_applied_modification_with_invalid_other_data_type(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.OTHER
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": False,
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Data type of {} is not of type {}.".format(request_data["modification_value"], str),
        )

    def test_update_applied_modification_with_invalid_equipment_status(self):
        self.modification.type = ModificationTypes.STATUS
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "status",
            "modification_value": "NOT" + EquipmentStatuses.FMC,
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully updated.")
        self.assertEqual(self.applied_modification.status, EquipmentStatuses.UNK)

    def test_update_applied_modification_with_valid_status(self):
        self.modification.type = ModificationTypes.STATUS
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "status",
            "modification_value": EquipmentStatuses.FMC,
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully updated.")
        self.assertEqual(self.applied_modification.status, EquipmentStatuses.FMC)

    def test_update_applied_modification_with_valid_installed(self):
        self.modification.type = ModificationTypes.INSTALL
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "installed",
            "modification_value": True,
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully updated.")
        self.assertEqual(self.applied_modification.installed, True)

    def test_update_applied_modification_with_valid_count(self):
        self.modification.type = ModificationTypes.COUNT
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "count",
            "modification_value": 51198,
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully updated.")
        self.assertEqual(self.applied_modification.count, 51198)

    def test_update_applied_modification_with_valid_other(self):
        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "New Other Data",
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully updated.")
        self.assertEqual(self.applied_modification.other, "New Other Data")

    def test_update_applied_modification_with_valid_category(self):
        self.modification.type = ModificationTypes.CATEGORY
        self.modification.save()
        self.applied_modification.other = None
        self.applied_modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "category",
            "modification_value": self.category.value,
        }

        response = self.client.put(
            reverse("update_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.applied_modification.refresh_from_db()

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully updated.")
        self.assertEqual(self.applied_modification.category.value, self.category.value)
