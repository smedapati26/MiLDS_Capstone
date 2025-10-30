from django.test import tag
from django.utils import timezone

from .test_transfer_request_setup import TransferRequestTest


@tag("transfer_request")
class ListTransferRequestTest(TransferRequestTest):
    def test_list_transfer_requests_admin(self):
        """
        Test valid list of transfer requests for the admin user.
        """
        expected = [
            {
                "aircraft": "AIRCRAFT0A01",
                "uac": None,
                "uav": None,
                "originating_uic": "TEST000A0",
                "destination_uic": "TEST001A0",
                "user_id": "0000000001",
                "id": 1,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "AIR",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            },
            {
                "aircraft": None,
                "uac": "UAC0A01",
                "uav": None,
                "originating_uic": "TEST001AA",
                "destination_uic": "TEST001A0",
                "user_id": "0000000000",
                "id": 2,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "UAC",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            },
            {
                "aircraft": None,
                "uac": None,
                "uav": "UAV0A01",
                "originating_uic": "TEST002AA",
                "destination_uic": "TEST001AA",
                "user_id": "0000000002",
                "id": 3,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "UAV",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            },
        ]
        response = self.admin_client.get(f"/object-transfer-request")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_list_transfer_requests_admin_filters(self):
        """
        Test valid list of transfer requests for the admin user.
        """
        expected_aircraft = [
            {
                "aircraft": "AIRCRAFT0A01",
                "uac": None,
                "uav": None,
                "originating_uic": "TEST000A0",
                "destination_uic": "TEST001A0",
                "user_id": "0000000001",
                "id": 1,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "AIR",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            }
        ]
        expected_uac = [
            {
                "aircraft": None,
                "uac": "UAC0A01",
                "uav": None,
                "originating_uic": "TEST001AA",
                "destination_uic": "TEST001A0",
                "user_id": "0000000000",
                "id": 2,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "UAC",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            }
        ]
        expected_uav = [
            {
                "aircraft": None,
                "uac": None,
                "uav": "UAV0A01",
                "originating_uic": "TEST002AA",
                "destination_uic": "TEST001AA",
                "user_id": "0000000002",
                "id": 3,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "UAV",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            }
        ]
        response = self.admin_client.get(f"/object-transfer-request?aircraft=AIRCRAFT0A01")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_aircraft)

        response = self.admin_client.get(f"/object-transfer-request?uac=UAC0A01")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uac)

        response = self.admin_client.get(f"/object-transfer-request?uav=UAV0A01")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uav)

        response = self.admin_client.get(f"/object-transfer-request?destination_uic=TEST001AA")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uav)

        response = self.admin_client.get(f"/object-transfer-request?originating_uic=TEST001AA")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uac)

        response = self.admin_client.get(f"/object-transfer-request?user_id=0000000002")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uav)

        response = self.admin_client.get("/object-transfer-request?user_id=0000000007")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        response = self.admin_client.get("/object-transfer-request?originating_uic=0000000007")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        date_str = timezone.now().strftime("%Y-%m-%d")
        response = self.admin_client.get(f"/object-transfer-request?date_requested={date_str}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_aircraft + expected_uac + expected_uav)

        response = self.admin_client.get(f"/object-transfer-request?uic=TEST001AA")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uac + expected_uav)

    def test_list_transfer_requests_elevated(self):
        """
        Test valid list of transfer requests for the elevated user.
        """
        expected = [
            {
                "aircraft": "AIRCRAFT0A01",
                "uac": None,
                "uav": None,
                "originating_uic": "TEST000A0",
                "destination_uic": "TEST001A0",
                "user_id": "0000000001",
                "id": 1,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "AIR",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            },
            {
                "aircraft": None,
                "uac": "UAC0A01",
                "uav": None,
                "originating_uic": "TEST001AA",
                "destination_uic": "TEST001A0",
                "user_id": "0000000000",
                "id": 2,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "UAC",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            },
        ]

        response = self.elevated_client.get(f"/object-transfer-request")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_list_transfer_requests_user(self):
        """
        Test valid list of transfer requests for the random user.
        """
        expected = [
            {
                "aircraft": None,
                "uac": None,
                "uav": "UAV0A01",
                "originating_uic": "TEST002AA",
                "destination_uic": "TEST001AA",
                "user_id": "0000000002",
                "id": 3,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "UAV",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            },
            {
                "aircraft": None,
                "uac": "UAC0A01",
                "uav": None,
                "originating_uic": "TEST001AA",
                "destination_uic": "TEST001A0",
                "user_id": "0000000000",
                "id": 2,
                "last_updated_datetime": self.now_format,
                "requested_object_type": "UAC",
                "originating_unit_approved": False,
                "destination_unit_approved": False,
                "permanent_transfer": True,
                "date_requested": self.now.strftime("%Y-%m-%d"),
                "status": "New",
            },
        ]
        response = self.client.get(f"/object-transfer-request")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_list_transfer_request_admin(self):
        """
        Test valid get transfer request for the admin user.
        """
        expected_aircraft = {
            "aircraft": "AIRCRAFT0A01",
            "uac": None,
            "uav": None,
            "originating_uic": "TEST000A0",
            "destination_uic": "TEST001A0",
            "user_id": "0000000001",
            "id": 1,
            "last_updated_datetime": self.now_format,
            "requested_object_type": "AIR",
            "originating_unit_approved": False,
            "destination_unit_approved": False,
            "permanent_transfer": True,
            "date_requested": self.now.strftime("%Y-%m-%d"),
            "status": "New",
        }
        expected_uac = {
            "aircraft": None,
            "uac": "UAC0A01",
            "uav": None,
            "originating_uic": "TEST001AA",
            "destination_uic": "TEST001A0",
            "user_id": "0000000000",
            "id": 2,
            "last_updated_datetime": self.now_format,
            "requested_object_type": "UAC",
            "originating_unit_approved": False,
            "destination_unit_approved": False,
            "permanent_transfer": True,
            "date_requested": self.now.strftime("%Y-%m-%d"),
            "status": "New",
        }
        expected_uav = {
            "aircraft": None,
            "uac": None,
            "uav": "UAV0A01",
            "originating_uic": "TEST002AA",
            "destination_uic": "TEST001AA",
            "user_id": "0000000002",
            "id": 3,
            "last_updated_datetime": self.now_format,
            "requested_object_type": "UAV",
            "originating_unit_approved": False,
            "destination_unit_approved": False,
            "permanent_transfer": True,
            "date_requested": self.now.strftime("%Y-%m-%d"),
            "status": "New",
        }

        response = self.admin_client.get("/object-transfer-request/1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_aircraft)

        response = self.admin_client.get("/object-transfer-request/2")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uac)

        response = self.admin_client.get("/object-transfer-request/3")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uav)

        response = self.elevated_client.get("/object-transfer-request/10")
        self.assertEqual(response.status_code, 404)

    def test_list_user_request_elevated(self):
        """
        Test single user requests for the elevated user.
        """
        expected_aircraft = {
            "aircraft": "AIRCRAFT0A01",
            "uac": None,
            "uav": None,
            "originating_uic": "TEST000A0",
            "destination_uic": "TEST001A0",
            "user_id": "0000000001",
            "id": 1,
            "last_updated_datetime": self.now_format,
            "requested_object_type": "AIR",
            "originating_unit_approved": False,
            "destination_unit_approved": False,
            "permanent_transfer": True,
            "date_requested": self.now.strftime("%Y-%m-%d"),
            "status": "New",
        }
        expected_uac = {
            "aircraft": None,
            "uac": "UAC0A01",
            "uav": None,
            "originating_uic": "TEST001AA",
            "destination_uic": "TEST001A0",
            "user_id": "0000000000",
            "id": 2,
            "last_updated_datetime": self.now_format,
            "requested_object_type": "UAC",
            "originating_unit_approved": False,
            "destination_unit_approved": False,
            "permanent_transfer": True,
            "date_requested": self.now.strftime("%Y-%m-%d"),
            "status": "New",
        }
        response = self.elevated_client.get("/object-transfer-request/1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_aircraft)

        response = self.elevated_client.get("/object-transfer-request/2")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uac)

        response = self.elevated_client.get("/object-transfer-request/3")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data, "No records for for id 3.")

    def test_list_transfer_request_user(self):
        """
        Test single transfer requests for the user.
        """
        expected_uac = {
            "aircraft": None,
            "uac": "UAC0A01",
            "uav": None,
            "originating_uic": "TEST001AA",
            "destination_uic": "TEST001A0",
            "user_id": "0000000000",
            "id": 2,
            "last_updated_datetime": self.now_format,
            "requested_object_type": "UAC",
            "originating_unit_approved": False,
            "destination_unit_approved": False,
            "permanent_transfer": True,
            "date_requested": self.now.strftime("%Y-%m-%d"),
            "status": "New",
        }
        expected_uav = {
            "aircraft": None,
            "uac": None,
            "uav": "UAV0A01",
            "originating_uic": "TEST002AA",
            "destination_uic": "TEST001AA",
            "user_id": "0000000002",
            "id": 3,
            "last_updated_datetime": self.now_format,
            "requested_object_type": "UAV",
            "originating_unit_approved": False,
            "destination_unit_approved": False,
            "permanent_transfer": True,
            "date_requested": self.now.strftime("%Y-%m-%d"),
            "status": "New",
        }
        response = self.client.get("/object-transfer-request/1")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data, "No records for for id 1.")

        response = self.client.get("/object-transfer-request/2")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uac)

        response = self.client.get("/object-transfer-request/3")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_uav)
