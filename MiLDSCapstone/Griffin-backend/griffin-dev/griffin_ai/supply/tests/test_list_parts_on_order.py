from django.test import TestCase, tag
from django.urls import reverse

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from supply.models import PartsOrder
from utils.tests import create_single_test_parts_order, create_test_units, get_default_top_unit, get_default_bottom_unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@tag("supply", "list_parts_on_order")
class ListPartsOnOrderViewTest(TestCase):
    def setUp(self):
        # Create a test unit
        self.units, self.hierarchy = create_test_units()
        self.highest_hq = get_default_top_unit()
        self.lowest_unit = get_default_bottom_unit()
        # Initial set up to create a test supply item for use in the tests
        self.parts_orders: dict[str, PartsOrder] = {}
        for i, unit in enumerate(self.units):
            self.parts_orders[unit.uic] = create_single_test_parts_order(
                unit=unit, dod_document_number="W000{}".format(i)
            )

    def test_invalid_unit_requested(self):
        """
        Checks the error message sent back if an invalid unit is requested
        """
        response = self.client.get(reverse("list_parts_on_order", kwargs={"uic": "Invalid"}))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
        )

    def test_list_parts_on_order_view(self):
        """
        Checks that parts order objects are returned in a list
        """
        response = self.client.get(reverse("list_parts_on_order", kwargs={"uic": self.lowest_unit.uic}))
        data = response.json()
        self.assertEqual(type(data), list)
        self.assertEqual(len(data), 1)
        first_order = data[0]
        self.assertEqual(type(first_order), dict)
        self.assertIn("dod_document_number", first_order)
        self.assertEqual(
            self.parts_orders[self.lowest_unit.uic].dod_document_number, first_order["dod_document_number"]
        )

    def test_all_orders_from_subordinate_units_returned(self):
        """
        Checks that a request for a unit returns parts requests within that unit and
        all units subordinate to it
        """
        response = self.client.get(reverse("list_parts_on_order", kwargs={"uic": self.highest_hq.uic}))
        data = response.json()
        self.assertEqual(type(data), list)
        self.assertEqual(len(self.parts_orders), len(data))

    def test_hidden_document_numbers_not_included(self):
        """
        Checks that hidden parts orders are not listed by this view
        """
        for i, unitorder in enumerate(self.parts_orders.items()):
            _, order = unitorder
            if i % 2 == 0:
                order.is_visible = False
                order.save()
        response = self.client.get(reverse("list_parts_on_order", kwargs={"uic": self.highest_hq.uic}))
        data = response.json()
        self.assertEqual(type(data), list)
        self.assertEqual(round(len(self.parts_orders) / 2, 0), len(data))
