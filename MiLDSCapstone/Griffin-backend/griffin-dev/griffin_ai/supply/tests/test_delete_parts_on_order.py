from django.test import TestCase, tag
from django.urls import reverse
from aircraft.models import Aircraft
from auto_dsr.models import Unit
from supply.models import PartsOrder
from utils.tests import create_single_test_parts_order, create_test_units, get_default_top_unit, get_default_bottom_unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_ORDER_DOES_NOT_EXIST


@tag("supply", "delete_parts_on_order")
class DeletePartsOnOrderViewTest(TestCase):
    def setUp(self):
        # Create a test unit
        self.units, self.hierarchy = create_test_units()
        self.highest_hq = get_default_top_unit()
        self.lowest_unit = get_default_bottom_unit()
        # Initial set up to create a test supply item for use in the test
        self.parts_orders: dict[str, PartsOrder] = {}
        for i, unit in enumerate(self.units):
            self.parts_orders[unit.uic] = create_single_test_parts_order(
                unit=unit, dod_document_number="W000{}".format(i)
            )

    def test_delete_nonexistant_order(self):
        """
        Checks that a deleted order is associated wih a valid DOD_docuemnt_number
        """
        response = self.client.delete(reverse("delete_parts_on_order", kwargs={"dod_document_number": "Invalid"}))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_ORDER_DOES_NOT_EXIST,
        )

    def test_successful_part_deletion(self):
        """
        Checks that deleted parts on order are successfully deleted
        """
        dod_doc_number = self.parts_orders[self.lowest_unit.uic].dod_document_number
        response = self.client.delete(reverse("delete_parts_on_order", kwargs={"dod_document_number": dod_doc_number}))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(PartsOrder.objects.filter(dod_document_number=dod_doc_number).exists())

    def test_invalid_request_type(self):
        """
        Checks that request type is a valid request type
        """
        dod_doc_number = self.parts_orders[self.lowest_unit.uic].dod_document_number
        response = self.client.post(reverse("delete_parts_on_order", kwargs={"dod_document_number": dod_doc_number}))
        self.assertEqual(response.status_code, 405)
