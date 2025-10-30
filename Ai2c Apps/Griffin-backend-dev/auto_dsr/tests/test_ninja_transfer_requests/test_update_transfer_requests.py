from django.test import tag

from auto_dsr.models import ObjectTransferRequest

from .test_transfer_request_setup import TransferRequestTest


@tag("transfer_request")
class UpdateTransferRequestTest(TransferRequestTest):

    def test_update_transfer_request(self):
        """
        Test for updating of transfer requests.
        """
        # Should fail as user did not create the request
        update_request = {
            "destination_uic": self.elevated_user.unit.uic,
        }
        response = self.client.put(f"/object-transfer-request/1", json=update_request)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data, {"success": False, "message": "You are not allowed to update this request."})

        # Should be successful
        update_request = {"destination_uic": self.random_user.unit.uic, "permanent_transfer": False}
        response = self.admin_client.put(f"/object-transfer-request/1", json=update_request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True})
        result_obj = ObjectTransferRequest.objects.get(id=1)
        self.assertEqual(result_obj.destination_unit.uic, self.random_user.unit.uic)
        self.assertEqual(result_obj.permanent_transfer, False)
