from django.test import TestCase, tag
from ninja.testing import TestClient

from aircraft.models import UnitAircraft
from auto_dsr.api.routes import auto_dsr_router
from auto_dsr.model_utils.status_manager import Statuses
from auto_dsr.model_utils.transfer_object_types import TransferObjectTypes
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import ObjectTransferLog, ObjectTransferRequest, Unit, UserRole
from uas.models import UnitUAC, UnitUAV
from utils.tests.test_aircraft_creation import create_single_test_aircraft
from utils.tests.test_object_transfer_request_creation import create_single_test_object_transfer_request
from utils.tests.test_uac_creation import create_single_test_uac
from utils.tests.test_uav_creation import create_single_test_uav
from utils.tests.test_unit_creation import create_test_units
from utils.tests.test_user_creation import create_test_user
from utils.tests.test_user_role_creation import create_user_role_in_all


@tag("transfer_request")
class AdjudicateTransferRequestTest(TestCase):
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

        self.client = TestClient(auto_dsr_router, headers={"Auth-User": self.user.user_id})

    # The following test cases are all for adjudication testing
    def test_manage_transfer_request_adjudication_with_no_user_id_in_header(self):
        # Make the API call
        response = self.client.post(
            "adjudicate-object-transfer-request",
            json=self.request_data,
        )

        # Assert the expected response
        self.assertEqual(response.status_code, 422)
        # Check Ninja missing field response
        self.assertEqual(
            response.data,
            {
                "detail": [
                    {"type": "missing", "loc": ["body", "payload", "transfer_request_ids"], "msg": "Field required"}
                ]
            },
        )

    def test_manage_transfer_request_adjudication_with_invalid_user_id(self):
        # Update the request headers and data
        self.request_data["transfer_request_ids"] = [self.aircraft_transfer_request.id]

        # Make the API call
        response = self.client.post(
            "adjudicate-object-transfer-request", json=self.request_data, headers={"Auth-User": "ABC"}
        )

        # Assert the expected response
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data, {"detail": "Unauthorized"})

    def test_manage_transfer_request_adjudication_with_invalid_json(self):
        # Update the request data
        self.request_data.pop("approved")
        self.request_data["transfer_request_ids"] = [self.aircraft_transfer_request.id]

        # Make the API call
        response = self.client.post(
            "adjudicate-object-transfer-request",
            json=self.request_data,
        )

        # Assert the expected response
        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.data,
            {"detail": [{"type": "missing", "loc": ["body", "payload", "approved"], "msg": "Field required"}]},
        )

    def test_manage_transfer_request_adjudication_with_invalid_transfer_request_id(self):
        # Update the request kwargs
        self.request_data["transfer_request_ids"] = [51198]

        # Make the API call
        response = self.client.post(
            "adjudicate-object-transfer-request",
            json=self.request_data,
        )

        # Set up the expected data and actual
        expected_data = {"user_permission": [], "adjudicated": [], "partial": []}

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, expected_data)

    def test_manage_transfer_request_adjudication_with_invalid_user_permissions(self):
        # Update the user Access Role for the originating unit, its parent unit and destination unit
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
            "adjudicate-object-transfer-request",
            json=self.request_data,
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

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, expected_data)

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

        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

        # Make the API call
        response = self.client.post(
            "adjudicate-object-transfer-request",
            json=self.request_data,
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

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, expected_data)

        # Assert the data on the backend has been updated
        self.aircraft_transfer_request.refresh_from_db()

        self.assertTrue(self.aircraft_transfer_request.originating_unit_approved)
        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

        self.uac_transfer_request.refresh_from_db()

        self.assertTrue(self.uac_transfer_request.originating_unit_approved)
        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

        self.uav_transfer_request.refresh_from_db()

        self.assertTrue(self.uav_transfer_request.originating_unit_approved)
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
            "adjudicate-object-transfer-request",
            json=self.request_data,
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

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, expected_data)

        # Assert the data on the backend has been updated
        self.aircraft_transfer_request.refresh_from_db()

        self.assertEqual(self.aircraft_transfer_request.destination_unit_approved, True)
        self.assertEqual(self.aircraft_transfer_request.requested_aircraft.current_unit, self.unit_0A0)

        self.assertEqual(ObjectTransferRequest.objects.count(), 3)

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
            "adjudicate-object-transfer-request",
            json=self.request_data,
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

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, expected_data)

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
        self.assertEqual(
            ObjectTransferLog.objects.filter(
                requested_aircraft=self.aircraft_transfer_request.requested_aircraft
            ).count(),
            1,
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uac=self.uac_transfer_request.requested_uac).count(), 1
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uav=self.uav_transfer_request.requested_uav).count(), 1
        )

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
            "adjudicate-object-transfer-request",
            json=self.request_data,
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

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, expected_data)

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
        self.assertEqual(
            ObjectTransferLog.objects.filter(
                requested_aircraft=self.aircraft_transfer_request.requested_aircraft
            ).count(),
            1,
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uac=self.uac_transfer_request.requested_uac).count(), 1
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uav=self.uav_transfer_request.requested_uav).count(), 1
        )

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
            "adjudicate-object-transfer-request",
            json=self.request_data,
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

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, expected_data)

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
        self.assertEqual(
            ObjectTransferLog.objects.filter(
                requested_aircraft=self.aircraft_transfer_request.requested_aircraft
            ).count(),
            0,
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uac=self.uac_transfer_request.requested_uac).count(), 0
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uav=self.uav_transfer_request.requested_uav).count(), 0
        )

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
            "adjudicate-object-transfer-request",
            json=self.request_data,
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

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, expected_data)

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
        self.assertEqual(
            ObjectTransferLog.objects.filter(
                requested_aircraft=self.aircraft_transfer_request.requested_aircraft
            ).count(),
            0,
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uac=self.uac_transfer_request.requested_uac).count(), 0
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uav=self.uav_transfer_request.requested_uav).count(), 0
        )

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
            "adjudicate-object-transfer-request",
            json=self.request_data,
        )

        # Set up the expected data and actual
        expected_data = {
            "user_permission": [non_user_rights_aircraft_transfer_request.requested_aircraft.serial],
            "adjudicated": [
                self.uav_transfer_request.requested_uav.serial_number,
            ],
            "partial": [partial_user_rights_uac_transfer_request.requested_uac.serial_number],
        }

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, expected_data)

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
        self.assertEqual(
            ObjectTransferLog.objects.filter(
                requested_aircraft=self.aircraft_transfer_request.requested_aircraft
            ).count(),
            0,
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uac=self.uac_transfer_request.requested_uac).count(), 0
        )
        self.assertEqual(
            ObjectTransferLog.objects.filter(requested_uav=self.uav_transfer_request.requested_uav).count(), 1
        )
