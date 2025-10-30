import json
from http import HTTPStatus

from django.db import transaction
from django.test import TestCase, tag
from django.urls import reverse

from aircraft.models import UnitAircraft
from auto_dsr.model_utils import TransferObjectTypes, UserRoleAccessLevel
from auto_dsr.models import ObjectTransferLog, ObjectTransferRequest, Unit
from uas.models import UnitUAC, UnitUAV
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_uac,
    create_single_test_uav,
    create_test_units,
    create_test_user,
    create_user_role_in_all,
    get_transient_unit,
)


@tag("auto_dsr", "object_transfer_request", "equipment_transfer")
class ManageAircraftTransferRequestCreationTest(TestCase):
    def setUp(self):
        create_test_units(transient_unit_needed=True)

        self.transient_unit = get_transient_unit()

        self.unit_0AA = Unit.objects.get(uic="TEST000AA")
        self.unit_0A0 = Unit.objects.get(uic="TEST000A0")
        self.unit_1AA = Unit.objects.get(uic="TEST001AA")

        self.aircraft_0A0_1 = create_single_test_aircraft(current_unit=self.unit_0A0, serial="AIRCRAFT0A01")
        self.aircraft_0A0_2 = create_single_test_aircraft(current_unit=self.unit_0A0, serial="AIRCRAFT0A02")
        self.aircraft_1AA_1 = create_single_test_aircraft(current_unit=self.unit_1AA, serial="AIRCRAFT1AA1")

        self.uac_0A0_1 = create_single_test_uac(current_unit=self.unit_0A0, serial_number="UAC0A01")
        self.uac_0A0_2 = create_single_test_uac(current_unit=self.unit_0A0, serial_number="UAC0A02")
        self.uac_1AA_1 = create_single_test_uac(current_unit=self.unit_1AA, serial_number="UAC1AA1")

        self.uav_0A0_1 = create_single_test_uav(current_unit=self.unit_0A0, serial_number="UAV0A01")
        self.uav_0A0_2 = create_single_test_uav(current_unit=self.unit_0A0, serial_number="UAV0A02")
        self.uav_1AA_1 = create_single_test_uav(current_unit=self.unit_1AA, serial_number="UAV1AA1")

        self.user = create_test_user(unit=self.unit_0AA)

        create_user_role_in_all(self.user, [self.unit_0AA, self.unit_0A0], UserRoleAccessLevel.ADMIN)
        create_user_role_in_all(self.user, [self.unit_1AA], UserRoleAccessLevel.READ)

        self.aircraft_request_data = {
            "destination_unit": self.unit_0AA.uic,
            "object_serials": [self.aircraft_0A0_1.serial, self.aircraft_0A0_2.serial, self.aircraft_1AA_1.serial],
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }
        self.uac_request_data = {
            "destination_unit": self.unit_0AA.uic,
            "object_serials": [
                self.uac_0A0_1.serial_number,
                self.uac_0A0_2.serial_number,
                self.uac_1AA_1.serial_number,
            ],
            "permanent": False,
            "type": TransferObjectTypes.UAC,
        }
        self.uav_request_data = {
            "destination_unit": self.unit_0AA.uic,
            "object_serials": [
                self.uav_0A0_1.serial_number,
                self.uav_0A0_2.serial_number,
                self.uav_1AA_1.serial_number,
            ],
            "permanent": False,
            "type": TransferObjectTypes.UAV,
        }

        self.request_headers = {"X-On-Behalf-Of": self.user.user_id}

    def test_equipment_transfer_with_no_user_id_in_header(self):
        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_equipment_transfer_with_invalid_user_id(self):
        # Update the request headers
        self.request_headers["X-On-Behalf-Of"] = "NOTAUSER"

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_equipment_transfer_with_invalid_destination_unit_json(self):
        # Update the request data
        self.aircraft_request_data.pop("destination_unit")

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_equipment_transfer_with_non_existing_destination_unit(self):
        # Update the request data
        self.aircraft_request_data["destination_unit"] = "NOTAUNIT"
        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_equipment_transfer_with_no_object_type_json(self):
        # Update the request data
        self.aircraft_request_data.pop("type")

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_equipment_transfer_with_no_object_type(self):
        # Update the request data
        self.aircraft_request_data["type"] = "INVALID"

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), "Invalid equipment transfer type.")

    def test_equipment_transfer_with_no_aircraft_serials_json(self):
        # Update the request data
        self.aircraft_request_data.pop("object_serials")

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_equipment_transfer_with_no_transient_unit(self):
        # Remove Transient Unit
        self.transient_unit.delete()

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            headers=self.request_headers,
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_equipment_transfer_with_no_objects_passed_in_to_transfer(self):
        # Update the request data
        self.aircraft_request_data["object_serials"] = ""

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), "No AIR found to transfer.")

        # Update the request data
        self.uac_request_data["object_serials"] = ""

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uac_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), "No UAC found to transfer.")

        # Update the request data
        self.uav_request_data["object_serials"] = ""

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uav_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), "No UAV found to transfer.")

    def test_equipment_transfer_with_no_permanent_json(self):
        # Update the request data
        self.aircraft_request_data.pop("permanent")

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_equipment_transfer_with_complex_non_permanent_transfer(self):
        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [self.aircraft_0A0_1.serial, self.aircraft_0A0_2.serial],
            "request_created": [self.aircraft_1AA_1.serial],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates
        self.aircraft_0A0_1.refresh_from_db()
        self.aircraft_0A0_2.refresh_from_db()

        self.assertEqual(self.aircraft_0A0_1.current_unit, self.unit_0AA)
        self.assertEqual(self.aircraft_0A0_2.current_unit, self.unit_0AA)
        self.assertEqual(ObjectTransferRequest.objects.count(), 1)
        self.assertEqual(ObjectTransferLog.objects.count(), 2)

        # Assert that UnitAircraft object were not deleted on the original unit
        self.assertEqual(UnitAircraft.objects.filter(uic=self.unit_0A0).count(), 2)

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uac_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [self.uac_0A0_1.serial_number, self.uac_0A0_2.serial_number],
            "request_created": [self.uac_1AA_1.serial_number],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates
        self.uac_0A0_1.refresh_from_db()
        self.uac_0A0_2.refresh_from_db()

        self.assertEqual(self.uac_0A0_1.current_unit, self.unit_0AA)
        self.assertEqual(self.uac_0A0_2.current_unit, self.unit_0AA)
        self.assertEqual(ObjectTransferRequest.objects.count(), 2)

        # Assert that UnitUAC object were not deleted on the original unit
        self.assertEqual(UnitUAC.objects.filter(unit=self.unit_0A0).count(), 2)

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uav_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [self.uav_0A0_1.serial_number, self.uav_0A0_2.serial_number],
            "request_created": [self.uav_1AA_1.serial_number],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates
        self.uav_0A0_1.refresh_from_db()
        self.uav_0A0_2.refresh_from_db()

        self.assertEqual(self.uav_0A0_1.current_unit, self.unit_0AA)
        self.assertEqual(self.uav_0A0_2.current_unit, self.unit_0AA)
        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

        # Assert that UnitUAV object were not deleted on the original unit
        self.assertEqual(UnitUAV.objects.filter(unit=self.unit_0A0).count(), 2)

    def test_equipment_transfer_with_complex_permanent_transfer(self):
        # Update the request data
        self.aircraft_request_data["permanent"] = True

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [self.aircraft_0A0_1.serial, self.aircraft_0A0_2.serial],
            "request_created": [self.aircraft_1AA_1.serial],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates
        self.aircraft_0A0_1.refresh_from_db()
        self.aircraft_0A0_2.refresh_from_db()

        self.assertEqual(self.aircraft_0A0_1.current_unit, self.unit_0AA)
        self.assertEqual(self.aircraft_0A0_2.current_unit, self.unit_0AA)
        self.assertEqual(ObjectTransferRequest.objects.count(), 1)
        self.assertEqual(ObjectTransferLog.objects.count(), 2)

        # Assert that UnitAircraft object were deleted on the original unit
        self.assertEqual(UnitAircraft.objects.filter(uic=self.unit_0A0).count(), 0)

        # Update the request data
        self.uac_request_data["permanent"] = True

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uac_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [self.uac_0A0_1.serial_number, self.uac_0A0_2.serial_number],
            "request_created": [self.uac_1AA_1.serial_number],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates
        self.uac_0A0_1.refresh_from_db()
        self.uac_0A0_2.refresh_from_db()

        self.assertEqual(self.uac_0A0_1.current_unit, self.unit_0AA)
        self.assertEqual(self.uac_0A0_2.current_unit, self.unit_0AA)
        self.assertEqual(ObjectTransferRequest.objects.count(), 2)

        # Assert that UnitUAC object were deleted on the original unit
        self.assertEqual(UnitUAC.objects.filter(unit=self.unit_0A0).count(), 0)

        # Update the request data
        self.uav_request_data["permanent"] = True

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uav_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [self.uav_0A0_1.serial_number, self.uav_0A0_2.serial_number],
            "request_created": [self.uav_1AA_1.serial_number],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates
        self.uav_0A0_1.refresh_from_db()
        self.uav_0A0_2.refresh_from_db()

        self.assertEqual(self.uav_0A0_1.current_unit, self.unit_0AA)
        self.assertEqual(self.uav_0A0_2.current_unit, self.unit_0AA)
        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

        # Assert that UnitUAV object were deleted on the original unit
        self.assertEqual(UnitUAV.objects.filter(unit=self.unit_0A0).count(), 0)

    def test_equipment_transfer_with_complex_permanent_transfer_with_no_admin_on_destination_unit(self):
        # Update the request data
        self.aircraft_request_data["permanent"] = True
        self.aircraft_request_data["destination_unit"] = self.unit_1AA.uic
        self.aircraft_request_data["object_serials"] = [self.aircraft_0A0_1.serial, self.aircraft_0A0_2.serial]

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [],
            "request_created": [self.aircraft_0A0_1.serial, self.aircraft_0A0_2.serial],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates
        self.aircraft_0A0_1.refresh_from_db()
        self.aircraft_0A0_2.refresh_from_db()

        self.assertEqual(self.aircraft_0A0_1.current_unit, self.transient_unit)
        self.assertEqual(self.aircraft_0A0_2.current_unit, self.transient_unit)
        self.assertEqual(ObjectTransferRequest.objects.count(), 2)
        self.assertEqual(ObjectTransferLog.objects.count(), 0)

        # Assert that UnitAircraft object were deleted on the original unit since the requesting user is an admin there
        self.assertEqual(UnitAircraft.objects.filter(uic=self.unit_0A0).count(), 0)

        # Update the request data
        self.uac_request_data["permanent"] = True
        self.uac_request_data["destination_unit"] = self.unit_1AA.uic
        self.uac_request_data["object_serials"] = [self.uac_0A0_1.serial_number, self.uac_0A0_2.serial_number]

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uac_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [],
            "request_created": [self.uac_0A0_1.serial_number, self.uac_0A0_2.serial_number],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates
        self.uac_0A0_1.refresh_from_db()
        self.uac_0A0_2.refresh_from_db()

        self.assertEqual(self.uac_0A0_1.current_unit, self.transient_unit)
        self.assertEqual(self.uac_0A0_2.current_unit, self.transient_unit)
        self.assertEqual(ObjectTransferRequest.objects.count(), 4)

        # Assert that UnitUAC object were deleted on the original unit
        self.assertEqual(UnitUAC.objects.filter(unit=self.unit_0A0).count(), 0)

        # Update the request data
        self.uav_request_data["permanent"] = True
        self.uav_request_data["destination_unit"] = self.unit_1AA.uic
        self.uav_request_data["object_serials"] = [self.uav_0A0_1.serial_number, self.uav_0A0_2.serial_number]

        # Make the API call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uav_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [],
            "request_created": [self.uav_0A0_1.serial_number, self.uav_0A0_2.serial_number],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates
        self.uav_0A0_1.refresh_from_db()
        self.uav_0A0_2.refresh_from_db()

        self.assertEqual(self.uav_0A0_1.current_unit, self.transient_unit)
        self.assertEqual(self.uav_0A0_2.current_unit, self.transient_unit)
        self.assertEqual(ObjectTransferRequest.objects.count(), 6)

        # Assert that UnitUAV object were deleted on the original unit
        self.assertEqual(UnitUAV.objects.filter(unit=self.unit_0A0).count(), 0)

    def test_equipment_transfer_with_existing_object_transfer_requests(self):
        # Ensure a Object Transfer Request is created from the api call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.aircraft_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        self.assertEqual(ObjectTransferRequest.objects.count(), 1)

        # Make the API call again
        with transaction.atomic():
            response = self.client.post(
                reverse("equipment_transfer"),
                data=json.dumps(self.aircraft_request_data),
                content_type="application/json",
                headers=self.request_headers,
            )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [],
            "request_created": [],
            "request_already_exists": [self.aircraft_1AA_1.serial],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates were still successful for the other aircraft
        self.aircraft_0A0_1.refresh_from_db()
        self.aircraft_0A0_2.refresh_from_db()

        self.assertEqual(self.aircraft_0A0_1.current_unit, self.unit_0AA)
        self.assertEqual(self.aircraft_0A0_2.current_unit, self.unit_0AA)
        self.assertEqual(ObjectTransferRequest.objects.count(), 1)
        self.assertEqual(ObjectTransferLog.objects.count(), 2)

        # Assert that UnitAircraft object were not deleted on the original unit
        self.assertEqual(UnitAircraft.objects.filter(uic=self.unit_0A0).count(), 2)

        # Ensure a Object Transfer Request is created from the api call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uac_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        self.assertEqual(ObjectTransferRequest.objects.count(), 2)

        # Make the API call again
        with transaction.atomic():
            response = self.client.post(
                reverse("equipment_transfer"),
                data=json.dumps(self.uac_request_data),
                content_type="application/json",
                headers=self.request_headers,
            )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [],
            "request_created": [],
            "request_already_exists": [self.uac_1AA_1.serial_number],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates were still successful for the other aircraft
        self.uac_0A0_1.refresh_from_db()
        self.uac_0A0_2.refresh_from_db()

        self.assertEqual(self.uac_0A0_1.current_unit, self.unit_0AA)
        self.assertEqual(self.uac_0A0_2.current_unit, self.unit_0AA)
        self.assertEqual(ObjectTransferRequest.objects.count(), 2)

        # Assert that UnitUAC object were not deleted on the original unit
        self.assertEqual(UnitUAC.objects.filter(unit=self.unit_0A0).count(), 2)

        # Ensure a Object Transfer Request is created from the api call
        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(self.uav_request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

        # Make the API call again
        with transaction.atomic():
            response = self.client.post(
                reverse("equipment_transfer"),
                data=json.dumps(self.uav_request_data),
                content_type="application/json",
                headers=self.request_headers,
            )

        # Setup the expected and actual response data
        expected_response_data = {
            "object_transferred": [],
            "request_created": [],
            "request_already_exists": [self.uav_1AA_1.serial_number],
        }

        actual_response_data = json.loads(response.content)

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response_data, expected_response_data)

        # Assert backend updates were still successful for the other aircraft
        self.uav_0A0_1.refresh_from_db()
        self.uav_0A0_2.refresh_from_db()

        self.assertEqual(self.uav_0A0_1.current_unit, self.unit_0AA)
        self.assertEqual(self.uav_0A0_2.current_unit, self.unit_0AA)
        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

        # Assert that UnitUAV object were not deleted on the original unit
        self.assertEqual(UnitUAV.objects.filter(unit=self.unit_0A0).count(), 2)

    def test_equipment_transfer_of_admin_with_open_request(self):
        creeate_data = {
            "destination_unit": self.unit_1AA.uic,
            "object_serials": [self.aircraft_0A0_1.serial],
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        transfer_data = {
            "destination_unit": self.unit_0AA.uic,
            "object_serials": [self.aircraft_0A0_1.serial, self.aircraft_0A0_2.serial],
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        response = self.client.post(
            reverse("equipment_transfer"),
            data=json.dumps(creeate_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        self.assertEqual(ObjectTransferRequest.objects.count(), 1)

        expected_response_data = {
            "object_transferred": [],
            "request_created": [self.aircraft_0A0_1.serial],
            "request_already_exists": [],
        }

        actual_response_data = json.loads(response.content)

        self.assertEqual(expected_response_data, actual_response_data)

        # Make the API call again
        with transaction.atomic():
            response = self.client.post(
                reverse("equipment_transfer"),
                data=json.dumps(transfer_data),
                content_type="application/json",
                headers=self.request_headers,
            )

            expected_response_data2 = {
                "object_transferred": [self.aircraft_0A0_2.serial],
                "request_created": [],
                "request_already_exists": [self.aircraft_0A0_1.serial],
            }

            actual_response_data2 = json.loads(response.content)

            self.assertEqual(actual_response_data2, expected_response_data2)
