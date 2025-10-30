from django.test import tag

from auto_dsr.models import ObjectTransferRequest

from .test_transfer_request_setup import TransferRequestTest


@tag("transfer_request")
class DeleteTransferRequestTest(TransferRequestTest):
    def test_delete_transfer_request(self):
        """
        Test for deleting of transfer requests.
        """
        # Should fail as elevated user did not create the request
        response = self.elevated_client.delete(f"/object-transfer-request/3")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.data, {"success": False, "message": "Only an admin or requesting user can delete a request."}
        )

        # Should fail as user did not create the request
        response = self.client.delete(f"/object-transfer-request/1")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.data, {"success": False, "message": "Only an admin or requesting user can delete a request."}
        )

        # Should delete as user did create the request
        response = self.client.delete(f"/object-transfer-request/3")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True})
        self.assertFalse(ObjectTransferRequest.objects.filter(id=3).exists())

        # Should delete as admins can delete any request.
        response = self.admin_client.delete(f"/object-transfer-request/1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True})
        self.assertFalse(ObjectTransferRequest.objects.filter(id=1).exists())

        # Should delete as admins can delete any request.
        response = self.admin_client.delete(f"/object-transfer-request/2")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True})
        self.assertFalse(ObjectTransferRequest.objects.filter(id=2).exists())
