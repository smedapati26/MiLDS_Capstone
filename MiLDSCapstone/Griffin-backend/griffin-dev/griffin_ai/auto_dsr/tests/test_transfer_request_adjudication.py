from django.urls import reverse
from django.test import TestCase, tag
from http import HTTPStatus
import json

from aircraft.models import UnitAircraft
from auto_dsr.models import UserRole, Unit, ObjectTransferRequest, ObjectTransferLog
from auto_dsr.model_utils import UserRoleAccessLevel, TransferObjectTypes
from uas.models import UnitUAC, UnitUAV

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)
from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    create_test_user,
    create_single_test_object_transfer_request,
    create_user_role_in_all,
    create_single_test_uac,
    create_single_test_uav,
)


@tag("auto_dsr", "object_transfer_request", "transfer_request_adjudication")
class ManageAircraftTransferRequestApprovalTest(TestCase):
    def setUp(self):
        create_test_units()

        self.unit_0AA = Unit.objects.get(uic="TEST000AA")
        self.unit_0A0 = Unit.objects.get(uic="TEST000A0")
        self.unit_1AA = Unit.objects.get(uic="TEST001AA")
        self.unit_1A0 = Unit.objects.get(uic="TEST001A0")
        self.unit_2AA = Unit.objects.get(uic="TEST002AA")

        self.aircraft = create_single_test_aircraft(current_unit=self.unit_0A0, serial="AIRCRAFT0A01")

        self.uac = create_single_test_uac(current_unit=self.unit_0A0, serial_number="UAC0A01")

        self.uav = create_single_test_uav(current_unit=self.unit_0A0, serial_number="UAC0A01")

        self.user = create_test_user(unit=self.unit_0AA)

        create_user_role_in_all(self.user, [self.unit_0AA, self.unit_0A0, self.unit_1A0])

        self.aircraft_transfer_request = create_single_test_object_transfer_request(
            object=self.aircraft,
            object_type=TransferObjectTypes.AIR,
            originating_unit=self.aircraft.current_unit,
            destination_unit=self.unit_1A0,
            requesting_user=self.user,
            permanent=True,
        )

        self.uac_transfer_request = create_single_test_object_transfer_request(
            object=self.uac,
            object_type=TransferObjectTypes.UAC,
            originating_unit=self.aircraft.current_unit,
            destination_unit=self.unit_1A0,
            requesting_user=self.user,
            permanent=True,
        )

        self.uav_transfer_request = create_single_test_object_transfer_request(
            object=self.uav,
            object_type=TransferObjectTypes.UAV,
            originating_unit=self.aircraft.current_unit,
            destination_unit=self.unit_1A0,
            requesting_user=self.user,
            permanent=True,
        )

        self.aircraft_request_kwargs = {
            "transfer_request_id": self.aircraft_transfer_request.id,
        }

        self.uac_request_kwargs = {
            "transfer_request_id": self.uac_transfer_request.id,
        }

        self.uav_request_kwargs = {
            "transfer_request_id": self.uav_transfer_request.id,
        }

        self.request_data = {"approved": True}

        self.request_headers = {"X-On-Behalf-Of": self.user.user_id}

    def test_manage_transfer_request_adjudication_with_no_user_id_in_header(self):
        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_manage_transfer_request_adjudication_with_invalid_user_id(self):
        # Update the request headers and data
        self.request_headers["X-On-Behalf-Of"] = "NOTAUSER"
        self.request_data["transfer_request_ids"] = [self.aircraft_transfer_request.id]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            data=json.dumps(self.request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_manage_transfer_request_adjudication_with_invalid_json(self):
        # Update the request data
        self.request_data.pop("approved")
        self.request_data["transfer_request_ids"] = [self.aircraft_transfer_request.id]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=self.request_data,
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_manage_transfer_request_adjudication_with_invalid_transfer_request_id(self):
        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [51198]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Set up the expected data and actual
        expected_data = {"user_permission": [], "adjudicated": [], "partial": []}
        actual_data = json.loads(response.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_manage_transfer_request_adjudication_with_invalid_user_permissions(self):
        # Update the user Access Role for the originating unit, its parent unit and destination unit
        originating_unit_access_role = UserRole.objects.get(user_id=self.user, unit=self.unit_0A0)
        originating_unit_access_role.access_level = UserRoleAccessLevel.READ
        originating_unit_access_role.save()

        originating_parent_unit_access_role = UserRole.objects.get(user_id=self.user, unit=self.unit_0AA)
        originating_parent_unit_access_role.access_level = UserRoleAccessLevel.READ
        originating_parent_unit_access_role.save()

        destination_unit_access_role = UserRole.objects.get(user_id=self.user, unit=self.unit_1A0)
        destination_unit_access_role.access_level = UserRoleAccessLevel.READ
        destination_unit_access_role.save()

        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [
            self.aircraft_transfer_request.id,
            self.uac_transfer_request.id,
            self.uav_transfer_request.id,
        ]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Set up the expected data and actual
        expected_data = {
            "user_permission": [
                self.aircraft_transfer_request.requested_aircraft.serial,
                self.uac_transfer_request.requested_uac.serial_number,
                self.uav_transfer_request.requested_uav.serial_number,
            ],
            "adjudicated": [],
            "partial": [],
        }
        actual_data = json.loads(response.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_manage_transfer_request_adjudication_with_approval_for_originating_unit(self):
        # Update the user Access Role for the destination unit
        destination_unit_access_role = UserRole.objects.get(user_id=self.user, unit=self.unit_1A0)
        destination_unit_access_role.access_level = UserRoleAccessLevel.READ
        destination_unit_access_role.save()

        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [
            self.aircraft_transfer_request.id,
            self.uac_transfer_request.id,
            self.uav_transfer_request.id,
        ]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Set up the expected data and actual
        expected_data = {
            "user_permission": [],
            "adjudicated": [],
            "partial": [
                self.aircraft_transfer_request.requested_aircraft.serial,
                self.uac_transfer_request.requested_uac.serial_number,
                self.uav_transfer_request.requested_uav.serial_number,
            ],
        }
        actual_data = json.loads(response.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

        # Assert the data on the backend has been updated
        self.aircraft_transfer_request.refresh_from_db()

        self.assertEqual(self.aircraft_transfer_request.originating_unit_approved, True)

        self.assertEqual(ObjectTransferRequest.objects.count(), 3)
        self.assertEqual(ObjectTransferLog.objects.count(), 0)

        self.uac_transfer_request.refresh_from_db()

        self.assertEqual(self.uac_transfer_request.originating_unit_approved, True)

        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

        self.uav_transfer_request.refresh_from_db()

        self.assertEqual(self.uav_transfer_request.originating_unit_approved, True)

        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

    def test_manage_transfer_request_adjudication_with_approval_for_destination_unit(self):
        # Update the user Access Role for the originating unit and its parent unit
        originating_unit_access_role = UserRole.objects.get(user_id=self.user, unit=self.unit_0A0)
        originating_unit_access_role.access_level = UserRoleAccessLevel.READ
        originating_unit_access_role.save()

        originating_parent_unit_access_role = UserRole.objects.get(user_id=self.user, unit=self.unit_0AA)
        originating_parent_unit_access_role.access_level = UserRoleAccessLevel.READ
        originating_parent_unit_access_role.save()

        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [
            self.aircraft_transfer_request.id,
            self.uac_transfer_request.id,
            self.uav_transfer_request.id,
        ]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Set up the expected data and actual
        expected_data = {
            "user_permission": [],
            "adjudicated": [],
            "partial": [
                self.aircraft_transfer_request.requested_aircraft.serial,
                self.uac_transfer_request.requested_uac.serial_number,
                self.uav_transfer_request.requested_uav.serial_number,
            ],
        }
        actual_data = json.loads(response.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

        # Assert the data on the backend has been updated
        self.aircraft_transfer_request.refresh_from_db()

        self.assertEqual(self.aircraft_transfer_request.destination_unit_approved, True)
        self.assertEqual(self.aircraft_transfer_request.requested_aircraft.current_unit, self.unit_0A0)

        self.assertEqual(ObjectTransferRequest.objects.count(), 3)
        self.assertEqual(ObjectTransferLog.objects.count(), 0)

        self.uac_transfer_request.refresh_from_db()

        self.assertEqual(self.uac_transfer_request.destination_unit_approved, True)
        self.assertEqual(self.uac_transfer_request.requested_uac.current_unit, self.unit_0A0)

        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

        self.uav_transfer_request.refresh_from_db()

        self.assertEqual(self.uav_transfer_request.destination_unit_approved, True)
        self.assertEqual(self.uav_transfer_request.requested_uav.current_unit, self.unit_0A0)

        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

    def test_manage_transfer_request_adjudication_with_permanent_transfer_and_approved(self):
        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [
            self.aircraft_transfer_request.id,
            self.uac_transfer_request.id,
            self.uav_transfer_request.id,
        ]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Set up the expected data and actual
        expected_data = {
            "user_permission": [],
            "adjudicated": [
                self.aircraft_transfer_request.requested_aircraft.serial,
                self.uac_transfer_request.requested_uac.serial_number,
                self.uav_transfer_request.requested_uav.serial_number,
            ],
            "partial": [],
        }
        actual_data = json.loads(response.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

        # Assert the backend has updated and Request was deleted
        self.aircraft.refresh_from_db()

        self.assertEqual(self.aircraft.current_unit, self.unit_1A0)
        self.assertEqual(
            UnitAircraft.objects.filter(uic__in=[self.unit_0A0, self.unit_0AA], serial=self.aircraft).exists(), False
        )
        self.assertEqual(UnitAircraft.objects.filter(uic=self.unit_1A0, serial=self.aircraft).exists(), True)
        self.assertEqual(UnitAircraft.objects.filter(uic=self.unit_1AA, serial=self.aircraft).exists(), True)

        self.uac.refresh_from_db()

        self.assertEqual(self.uac.current_unit, self.unit_1A0)
        self.assertEqual(UnitUAC.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uac=self.uac).exists(), False)
        self.assertEqual(UnitUAC.objects.filter(unit=self.unit_1A0, uac=self.uac).exists(), True)
        self.assertEqual(UnitUAC.objects.filter(unit=self.unit_1AA, uac=self.uac).exists(), True)

        self.uav.refresh_from_db()

        self.assertEqual(self.uav.current_unit, self.unit_1A0)
        self.assertEqual(UnitUAV.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uav=self.uav).exists(), False)
        self.assertEqual(UnitUAV.objects.filter(unit=self.unit_1A0, uav=self.uav).exists(), True)
        self.assertEqual(UnitUAV.objects.filter(unit=self.unit_1AA, uav=self.uav).exists(), True)

        self.assertEqual(ObjectTransferRequest.objects.count(), 0)
        self.assertEqual(ObjectTransferLog.objects.count(), 3)

    def test_manage_transfer_request_adjudication_with_non_permanent_transfer_and_approved(self):
        # Update the transfer requests
        self.aircraft_transfer_request.permanent_transfer = False
        self.aircraft_transfer_request.save()

        self.uac_transfer_request.permanent_transfer = False
        self.uac_transfer_request.save()

        self.uav_transfer_request.permanent_transfer = False
        self.uav_transfer_request.save()

        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [
            self.aircraft_transfer_request.id,
            self.uac_transfer_request.id,
            self.uav_transfer_request.id,
        ]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Set up the expected data and actual
        expected_data = {
            "user_permission": [],
            "adjudicated": [
                self.aircraft_transfer_request.requested_aircraft.serial,
                self.uac_transfer_request.requested_uac.serial_number,
                self.uav_transfer_request.requested_uav.serial_number,
            ],
            "partial": [],
        }
        actual_data = json.loads(response.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

        # Assert the backend has updated and Request was deleted
        self.aircraft.refresh_from_db()

        self.assertEqual(self.aircraft.current_unit, self.unit_1A0)
        self.assertEqual(
            UnitAircraft.objects.filter(uic__in=[self.unit_0A0, self.unit_0AA], serial=self.aircraft).exists(), True
        )
        self.assertEqual(UnitAircraft.objects.filter(uic=self.unit_1A0, serial=self.aircraft).exists(), True)
        self.assertEqual(UnitAircraft.objects.filter(uic=self.unit_1AA, serial=self.aircraft).exists(), True)

        self.uac.refresh_from_db()

        self.assertEqual(self.uac.current_unit, self.unit_1A0)
        self.assertEqual(UnitUAC.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uac=self.uac).exists(), True)
        self.assertEqual(UnitUAC.objects.filter(unit=self.unit_1A0, uac=self.uac).exists(), True)
        self.assertEqual(UnitUAC.objects.filter(unit=self.unit_1AA, uac=self.uac).exists(), True)

        self.uav.refresh_from_db()

        self.assertEqual(self.uav.current_unit, self.unit_1A0)
        self.assertEqual(UnitUAV.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uav=self.uav).exists(), True)
        self.assertEqual(UnitUAV.objects.filter(unit=self.unit_1A0, uav=self.uav).exists(), True)
        self.assertEqual(UnitUAV.objects.filter(unit=self.unit_1AA, uav=self.uav).exists(), True)

        self.assertEqual(ObjectTransferRequest.objects.count(), 0)
        self.assertEqual(ObjectTransferLog.objects.count(), 3)

    def test_manage_transfer_request_adjudication_with_permanent_transfer_and_denied(self):
        # Update the request data
        self.request_data["approved"] = False

        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [
            self.aircraft_transfer_request.id,
            self.uac_transfer_request.id,
            self.uav_transfer_request.id,
        ]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Set up the expected data and actual
        expected_data = {
            "user_permission": [],
            "adjudicated": [
                self.aircraft_transfer_request.requested_aircraft.serial,
                self.uac_transfer_request.requested_uac.serial_number,
                self.uav_transfer_request.requested_uav.serial_number,
            ],
            "partial": [],
        }
        actual_data = json.loads(response.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

        # Assert the backend has not updated and request was deleted
        self.aircraft.refresh_from_db()

        self.assertEqual(self.aircraft.current_unit, self.unit_0A0)
        self.assertEqual(
            UnitAircraft.objects.filter(uic__in=[self.unit_0A0, self.unit_0AA], serial=self.aircraft).exists(), True
        )
        self.assertEqual(
            UnitAircraft.objects.filter(uic__in=[self.unit_1A0, self.unit_1AA], serial=self.aircraft).exists(), False
        )

        self.uac.refresh_from_db()

        self.assertEqual(self.uac.current_unit, self.unit_0A0)
        self.assertEqual(UnitUAC.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uac=self.uac).exists(), True)
        self.assertEqual(UnitUAC.objects.filter(unit__in=[self.unit_1A0, self.unit_1AA], uac=self.uac).exists(), False)

        self.uav.refresh_from_db()

        self.assertEqual(self.uav.current_unit, self.unit_0A0)
        self.assertEqual(UnitUAV.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uav=self.uav).exists(), True)
        self.assertEqual(UnitUAV.objects.filter(unit__in=[self.unit_1A0, self.unit_1AA], uav=self.uav).exists(), False)

        self.assertEqual(ObjectTransferRequest.objects.count(), 0)
        self.assertEqual(ObjectTransferLog.objects.count(), 3)

    def test_manage_transfer_request_adjudication_with_non_permanent_transfer_and_denied(self):
        # Update the request data
        self.request_data["approved"] = False

        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [
            self.aircraft_transfer_request.id,
            self.uac_transfer_request.id,
            self.uav_transfer_request.id,
        ]

        # Update the aricraft transfer request
        self.aircraft_transfer_request.permanent_transfer = False
        self.aircraft_transfer_request.save()

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Set up the expected data and actual
        expected_data = {
            "user_permission": [],
            "adjudicated": [
                self.aircraft_transfer_request.requested_aircraft.serial,
                self.uac_transfer_request.requested_uac.serial_number,
                self.uav_transfer_request.requested_uav.serial_number,
            ],
            "partial": [],
        }
        actual_data = json.loads(response.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

        # Assert the backend has not updated and request was deleted
        self.aircraft.refresh_from_db()

        self.assertEqual(self.aircraft.current_unit, self.unit_0A0)
        self.assertEqual(
            UnitAircraft.objects.filter(uic__in=[self.unit_0A0, self.unit_0AA], serial=self.aircraft).exists(), True
        )
        self.assertEqual(
            UnitAircraft.objects.filter(uic__in=[self.unit_1A0, self.unit_1AA], serial=self.aircraft).exists(), False
        )

        self.uac.refresh_from_db()

        self.assertEqual(self.uac.current_unit, self.unit_0A0)
        self.assertEqual(UnitUAC.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uac=self.uac).exists(), True)
        self.assertEqual(UnitUAC.objects.filter(unit__in=[self.unit_1A0, self.unit_1AA], uac=self.uac).exists(), False)

        self.uav.refresh_from_db()

        self.assertEqual(self.uav.current_unit, self.unit_0A0)
        self.assertEqual(UnitUAV.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uav=self.uav).exists(), True)
        self.assertEqual(UnitUAV.objects.filter(unit__in=[self.unit_1A0, self.unit_1AA], uav=self.uav).exists(), False)

        self.assertEqual(ObjectTransferRequest.objects.count(), 0)
        self.assertEqual(ObjectTransferLog.objects.count(), 3)

    def test_manage_transfer_request_adjudication_all_outcomes(self):
        # Update the request data
        self.aircraft_transfer_request.delete()
        self.uac_transfer_request.delete()

        self.aircraft.uic.clear()

        self.aircraft.current_unit = self.unit_1AA
        self.aircraft.save()

        self.aircraft.uic.add(self.unit_1AA, *self.unit_1AA.parent_uics)

        non_user_rights_aircraft_transfer_request = create_single_test_object_transfer_request(
            object=self.aircraft,
            object_type=TransferObjectTypes.AIR,
            originating_unit=self.aircraft.current_unit,
            destination_unit=self.unit_2AA,
            requesting_user=self.user,
            permanent=True,
        )

        partial_user_rights_uac_transfer_request = create_single_test_object_transfer_request(
            object=self.uac,
            object_type=TransferObjectTypes.UAC,
            originating_unit=self.uac.current_unit,
            destination_unit=self.unit_2AA,
            requesting_user=self.user,
            permanent=True,
        )

        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [
            non_user_rights_aircraft_transfer_request.id,
            partial_user_rights_uac_transfer_request.id,
            self.uav_transfer_request.id,
        ]

        # Make the API call
        response = self.client.post(
            reverse("transfer_request_adjudication"),
            headers=self.request_headers,
            data=json.dumps(self.request_data),
            content_type="application/json",
        )

        # Set up the expected data and actual
        expected_data = {
            "user_permission": [non_user_rights_aircraft_transfer_request.requested_aircraft.serial],
            "adjudicated": [
                self.uav_transfer_request.requested_uav.serial_number,
            ],
            "partial": [partial_user_rights_uac_transfer_request.requested_uac.serial_number],
        }
        actual_data = json.loads(response.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

        # Assert the backend has proper updates
        self.aircraft.refresh_from_db()
        non_user_rights_aircraft_transfer_request.refresh_from_db()

        self.assertEqual(self.aircraft.current_unit, self.unit_1AA)
        self.assertEqual(non_user_rights_aircraft_transfer_request.destination_unit_approved, False)
        self.assertEqual(non_user_rights_aircraft_transfer_request.originating_unit_approved, False)
        self.assertEqual(UnitAircraft.objects.filter(uic__in=[self.unit_1AA], serial=self.aircraft).exists(), True)
        self.assertEqual(UnitAircraft.objects.filter(uic__in=[self.unit_2AA], serial=self.aircraft).exists(), False)

        self.uac.refresh_from_db()
        partial_user_rights_uac_transfer_request.refresh_from_db()

        self.assertEqual(partial_user_rights_uac_transfer_request.originating_unit_approved, True)
        self.assertEqual(UnitUAC.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uac=self.uac).exists(), True)
        self.assertEqual(UnitUAC.objects.filter(unit__in=[self.unit_2AA], uac=self.uac).exists(), False)

        self.uav.refresh_from_db()

        self.assertEqual(self.uav.current_unit, self.unit_1A0)
        self.assertEqual(UnitUAV.objects.filter(unit__in=[self.unit_1A0, self.unit_1AA], uav=self.uav).exists(), True)
        self.assertEqual(UnitUAV.objects.filter(unit__in=[self.unit_0A0, self.unit_0AA], uav=self.uav).exists(), False)

        self.assertEqual(ObjectTransferRequest.objects.count(), 2)
        self.assertEqual(ObjectTransferLog.objects.count(), 1)
