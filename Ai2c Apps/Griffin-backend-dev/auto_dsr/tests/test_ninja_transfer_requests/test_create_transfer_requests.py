from django.test import tag

from auto_dsr.model_utils import Statuses
from auto_dsr.model_utils.transfer_object_types import TransferObjectTypes
from auto_dsr.models import ObjectTransferLog, ObjectTransferRequest
from notifications.models import TransferRequestNotification

from .test_transfer_request_setup import TransferRequestTest


@tag("transfer_request")
class CreateTransferRequestTest(TransferRequestTest):
    def test_create_transfer_request_aircraft_user(self):
        """
        Test creating a transfer request by user for an aircraft.
        """
        request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "requested_by_user": self.elevated_user.user_id,
            "aircraft": self.aircraft2.serial,
            "status": Statuses.NEW,
            "permanent_transfer": False,
            "requested_object_type": TransferObjectTypes.AIR,
        }
        # Create Request
        response = self.elevated_client.post("/object-transfer-request", json=request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "id": 4, "message": "Request Created"})
        self.assertTrue(ObjectTransferRequest.objects.filter(id=4).exists())
        self.assertTrue(
            TransferRequestNotification.objects.filter(
                transfer_request=ObjectTransferRequest.objects.get(id=4)
            ).exists()
        )

        # Create Duplicate Request, should fail
        response = self.elevated_client.post("/object-transfer-request", json=request)
        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.data,
            {
                "id": None,
                "message": "UNIQUE constraint failed: auto_dsr_object_transfer_requests.requested_aircraft_serial_number",
                "success": False,
            },
        )

    def test_create_transfer_request_uac_user(self):
        """
        Test creating a transfer request by user for an uac.
        """
        uac_request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "uac": self.uac2.serial_number,
            "status": Statuses.NEW,
            "permanent_transfer": False,
            "requested_object_type": TransferObjectTypes.UAC,
        }
        # Create Request
        response = self.elevated_client.post("/object-transfer-request", json=uac_request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "id": 4, "message": "Request Created"})
        self.assertTrue(ObjectTransferRequest.objects.filter(id=4).exists())
        self.assertTrue(
            TransferRequestNotification.objects.filter(
                transfer_request=ObjectTransferRequest.objects.get(id=4)
            ).exists()
        )

        # Create Duplicate Request, should fail
        response = self.elevated_client.post("/object-transfer-request", json=uac_request)
        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.data,
            {
                "id": None,
                "message": "UNIQUE constraint failed: auto_dsr_object_transfer_requests.requested_uac_serial_number",
                "success": False,
            },
        )

    def test_create_transfer_request_uav_user(self):
        """
        Test creating a transfer request by user for an uav.
        """
        uav_request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "uav": self.uav2.serial_number,
            "status": Statuses.NEW,
            "permanent_transfer": False,
            "requested_object_type": TransferObjectTypes.UAV,
        }
        # Create Request
        response = self.elevated_client.post("/object-transfer-request", json=uav_request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "id": 4, "message": "Request Created"})
        self.assertTrue(ObjectTransferRequest.objects.filter(id=4).exists())
        self.assertTrue(
            TransferRequestNotification.objects.filter(
                transfer_request=ObjectTransferRequest.objects.get(id=4)
            ).exists()
        )

        # Create Duplicate Request, should fail
        response = self.elevated_client.post("/object-transfer-request", json=uav_request)
        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.data,
            {
                "id": None,
                "message": "UNIQUE constraint failed: auto_dsr_object_transfer_requests.requested_uav_serial_number",
                "success": False,
            },
        )

    def test_create_transfer_request_aircraft_admin(self):
        """
        Test creating a transfer request by admin for an aircraft.
        """
        request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "requested_by_user": self.admin_user.user_id,
            "aircraft": self.aircraft2.serial,
            "status": Statuses.NEW,
            "permanent_transfer": False,
            "requested_object_type": TransferObjectTypes.AIR,
        }
        # Create Request
        response = self.admin_client.post("/object-transfer-request", json=request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "id": None, "message": "Request adjudicated automatically."})
        self.assertEqual(ObjectTransferLog.objects.filter(requested_aircraft=self.aircraft2).count(), 1)

    def test_create_transfer_request_aircraft_admin_permanent(self):
        """
        Test creating a transfer request by admin for an aircraft.
        """
        request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "requested_by_user": self.admin_user.user_id,
            "aircraft": self.aircraft2.serial,
            "status": Statuses.NEW,
            "permanent_transfer": True,
            "requested_object_type": TransferObjectTypes.AIR,
        }
        # Create Request
        response = self.admin_client.post("/object-transfer-request", json=request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "id": None, "message": "Request adjudicated automatically."})
        self.assertEqual(ObjectTransferLog.objects.filter(requested_aircraft=self.aircraft2).count(), 1)

    def test_create_uac_transfer_request_admin(self):
        """
        Test creating a transfer request by admin for a uac.
        """
        uac_request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "uac": self.uac2.serial_number,
            "status": Statuses.NEW,
            "permanent_transfer": False,
            "requested_object_type": TransferObjectTypes.UAC,
        }

        response = self.admin_client.post("/object-transfer-request", json=uac_request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "id": None, "message": "Request adjudicated automatically."})
        self.assertEqual(ObjectTransferLog.objects.filter(requested_uac=self.uac2).count(), 1)

    def test_create_uac_transfer_request_admin_permanent(self):
        """
        Test creating a transfer request by admin for a uac.
        """
        uac_request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "uac": self.uac2.serial_number,
            "status": Statuses.NEW,
            "permanent_transfer": True,
            "requested_object_type": TransferObjectTypes.UAC,
        }

        response = self.admin_client.post("/object-transfer-request", json=uac_request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "id": None, "message": "Request adjudicated automatically."})
        self.assertEqual(ObjectTransferLog.objects.filter(requested_uac=self.uac2).count(), 1)

    def test_create_uav_transfer_request_admin(self):
        """
        Test creating a transfer request by admin for a uav.
        """
        uav_request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "uav": self.uav2.serial_number,
            "status": Statuses.NEW,
            "permanent_transfer": False,
            "requested_object_type": TransferObjectTypes.UAV,
        }

        response = self.admin_client.post("/object-transfer-request", json=uav_request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "id": None, "message": "Request adjudicated automatically."})
        self.assertEqual(ObjectTransferLog.objects.filter(requested_uav=self.uav2).count(), 1)

    def test_create_invalids_transfer_request_admin(self):
        """
        Test creating a transfer request by admin for a uav.
        """
        uav_request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "uav": self.uav2.serial_number,
            "status": Statuses.NEW,
            "permanent_transfer": False,
            "requested_object_type": "XYZ",
        }

        response = self.admin_client.post("/object-transfer-request", json=uav_request)
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.data, {"success": False, "id": None, "message": "Unknown type"})

        uav_request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "uav": self.uav2.serial_number,
            "status": Statuses.NEW,
            "permanent_transfer": False,
        }

        response = self.admin_client.post("/object-transfer-request", json=uav_request)
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.data, {"success": False, "id": None, "message": "Unknown type"})

        uav_request = {
            "uav": self.uav2.serial_number,
            "status": Statuses.NEW,
            "permanent_transfer": False,
            "requested_object_type": "XYZ",
        }

        response = self.admin_client.post("/object-transfer-request", json=uav_request)
        self.assertEqual(response.status_code, 422)

        uav_request = {
            "originating_uic": self.admin_user.unit.uic,
            "destination_uic": self.elevated_user.unit.uic,
            "uav": self.uav2.serial_number,
            "status": Statuses.NEW,
            "permanent_transfer": False,
            "requested_object_type": TransferObjectTypes.AIR,
        }

        response = self.admin_client.post("/object-transfer-request", json=uav_request)
        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.data,
            {"success": False, "id": None, "message": "Aircraft, UAC, or UAV required and must match type."},
        )
