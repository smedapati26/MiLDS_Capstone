import json
from http import HTTPStatus

from django.db import transaction
from django.test import TestCase, tag
from django.urls import reverse

from aircraft.model_utils import EquipmentStatuses, ModificationTypes
from aircraft.models import AppliedModification
from utils.http import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
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


@tag("aircraft", "create", "applied_modification")
class AppliedModifictionCreateTest(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(self.unit)

        self.modification = create_single_test_modification("Wings")
        self.category = create_single_test_modification_category(self.modification)

    def test_create_applied_modification_with_invalid_modification(self):
        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "Other Data",
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": "NOT" + self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_invalid_aircraft_json_format(self):
        request_data = {
            "NOT" + "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "Other Data",
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_invalid_aircraft_serial(self):
        request_data = {
            "aircraft_serial": "NOT" + self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "Other Data",
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_invalid_data_column_json_format(self):
        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "NOT" + "modification_key": "other",
            "modification_value": "Other Data",
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_invalid_data_json_format(self):
        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "NOT" + "modification_value": "Other Data",
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_non_category_modification(self):
        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "category",
            "modification_value": self.category.value,
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"), "Modification {} is not of type Category.".format(self.modification.name)
        )
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_invalid_modification_category(self):
        # Update Modification to be applied to be a Category
        self.modification.type = ModificationTypes.CATEGORY
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "category",
            "modification_value": "NOT" + self.category.value,
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST)
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_invalid_equipment_status(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.STATUS
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "status",
            "modification_value": "NOT" + EquipmentStatuses.FMC,
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully applied.")
        self.assertEqual(
            AppliedModification.objects.get(modification=self.modification, aircraft=self.aircraft).status,
            EquipmentStatuses.UNK,
        )
        self.assertEqual(AppliedModification.objects.count(), 1)

    def test_create_applied_modification_with_existing_modification_applied_already(self):
        create_single_test_applied_modification(modification=self.modification, aircraft=self.aircraft)

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "Other Data",
        }

        with transaction.atomic():
            response = self.client.post(
                reverse("create_applied_modification", kwargs={"name": self.modification.name}),
                data=json.dumps(request_data),
                content_type="application/json",
            )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Could not apply Modification; it is likely that {} is already applied to {}.".format(
                self.modification, self.aircraft.serial
            ),
        )
        self.assertEqual(AppliedModification.objects.count(), 1)

    def test_create_applied_modification_with_invalid_install_data_type(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.INSTALL
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "installed",
            "modification_value": 51198,
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Data type of {} is not of type {}.".format(request_data["modification_value"], bool),
        )
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_invalid_count_data_type(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.COUNT
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "count",
            "modification_value": "Other Data",
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Data type of {} is not of type {}.".format(request_data["modification_value"], int),
        )
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_invalid_other_data_type(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.OTHER
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": False,
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Data type of {} is not of type {}.".format(request_data["modification_value"], str),
        )
        self.assertEqual(AppliedModification.objects.count(), 0)

    def test_create_applied_modification_with_valid_equipment_status(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.STATUS
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "status",
            "modification_value": EquipmentStatuses.FMC,
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully applied.")
        self.assertEqual(
            AppliedModification.objects.get(modification=self.modification, aircraft=self.aircraft).status,
            EquipmentStatuses.FMC,
        )
        self.assertEqual(AppliedModification.objects.count(), 1)

    def test_create_applied_modification_with_valid_install(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.INSTALL
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "installed",
            "modification_value": True,
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully applied.")
        self.assertEqual(
            AppliedModification.objects.get(modification=self.modification, aircraft=self.aircraft).installed, True
        )
        self.assertEqual(AppliedModification.objects.count(), 1)

    def test_create_applied_modification_with_valid_count(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.COUNT
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "count",
            "modification_value": 51198,
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully applied.")
        self.assertEqual(
            AppliedModification.objects.get(modification=self.modification, aircraft=self.aircraft).count, 51198
        )
        self.assertEqual(AppliedModification.objects.count(), 1)

    def test_create_applied_modification_with_valid_other(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.OTHER
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "other",
            "modification_value": "Other Data",
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully applied.")
        self.assertEqual(
            AppliedModification.objects.get(modification=self.modification, aircraft=self.aircraft).other, "Other Data"
        )
        self.assertEqual(AppliedModification.objects.count(), 1)

    def test_create_applied_modification_with_valid_category(self):
        # Update Modification to be Status
        self.modification.type = ModificationTypes.CATEGORY
        self.modification.save()

        request_data = {
            "aircraft_serial": self.aircraft.serial,
            "modification_key": "category",
            "modification_value": self.category.value,
        }

        response = self.client.post(
            reverse("create_applied_modification", kwargs={"name": self.modification.name}),
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Modification successfully applied.")
        self.assertEqual(
            AppliedModification.objects.get(modification=self.modification, aircraft=self.aircraft).category.value,
            self.category.value,
        )
        self.assertEqual(AppliedModification.objects.count(), 1)
