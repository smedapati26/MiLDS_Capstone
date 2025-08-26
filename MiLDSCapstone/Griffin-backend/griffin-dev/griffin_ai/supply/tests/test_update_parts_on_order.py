from django.test import TestCase, tag
from django.urls import reverse
import json


from supply.models import PartsOrder
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_ORDER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST,
)
from utils.tests import (
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
    create_single_test_parts_order,
    create_single_test_aircraft,
    create_single_test_agse,
)


@tag("supply", "update_parts_order")
class UpdatePartsOrderViewTest(TestCase):
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
        # create some aircraft and agse
        self.aircraft = create_single_test_aircraft(current_unit=self.lowest_unit)
        self.agse = create_single_test_agse(current_unit=self.lowest_unit)

    def test_update_with_invalid_method(self):
        """
        Checks that an invalid method will not update the part
        """
        response = self.client.get(
            reverse(
                "update_parts_order",
                kwargs={"dod_document_number": self.parts_orders[self.highest_hq.uic].dod_document_number},
            )
        )
        self.assertEqual(response.status_code, 405)

    def test_update_non_existing_order(self):
        """
        Checks that a request to update a non-existant part returns an error
        """
        response = self.client.post(
            reverse(
                "update_parts_order",
                kwargs={"dod_document_number": "WINVALID"},
            ),
            json.dumps({"carrier": "UPS"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_ORDER_DOES_NOT_EXIST,
        )

    def test_update_single_field(self):
        """
        Checks that a request to update a non-existant part returns an error
        """
        order_to_change = self.parts_orders[self.highest_hq.uic]
        response = self.client.post(
            reverse(
                "update_parts_order",
                kwargs={"dod_document_number": order_to_change.dod_document_number},
            ),
            json.dumps({"carrier": "UPS"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        order_to_change.refresh_from_db()
        self.assertEqual(order_to_change.carrier, "UPS")

    def test_update_invalid_unit(self):
        """
        Checks that a request to update a non-existant part returns an error
        """
        order_to_change = self.parts_orders[self.lowest_unit.uic]
        response = self.client.post(
            reverse(
                "update_parts_order",
                kwargs={"dod_document_number": order_to_change.dod_document_number},
            ),
            json.dumps({"uic": "NOTAUIC"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
        )

    def test_update_unit(self):
        """
        Checks that a request to update a non-existant part returns an error
        """
        order_to_change = self.parts_orders[self.lowest_unit.uic]
        response = self.client.post(
            reverse(
                "update_parts_order",
                kwargs={"dod_document_number": order_to_change.dod_document_number},
            ),
            json.dumps({"uic": self.lowest_unit.uic}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        order_to_change.refresh_from_db()
        self.assertEqual(order_to_change.unit, self.lowest_unit)

    def test_update_invalid_aircraft(self):
        """
        Checks that a request to update with a non-existant aircraft throws an error
        """
        order_to_change = self.parts_orders[self.lowest_unit.uic]
        response = self.client.post(
            reverse(
                "update_parts_order",
                kwargs={"dod_document_number": order_to_change.dod_document_number},
            ),
            json.dumps({"aircraft_serial_number": "NOTASERIAL"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
        )

    def test_update_aircraft(self):
        """
        Checks that a request to update with an aircraft works
        """
        order_to_change = self.parts_orders[self.lowest_unit.uic]
        response = self.client.post(
            reverse(
                "update_parts_order",
                kwargs={"dod_document_number": order_to_change.dod_document_number},
            ),
            json.dumps({"aircraft_serial_number": self.aircraft.serial}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        order_to_change.refresh_from_db()
        self.assertEqual(order_to_change.aircraft, self.aircraft)

    def test_update_invalid_agse(self):
        """
        Checks that a request to update with a non-existant agse returns an error
        """
        order_to_change = self.parts_orders[self.lowest_unit.uic]
        response = self.client.post(
            reverse(
                "update_parts_order",
                kwargs={"dod_document_number": order_to_change.dod_document_number},
            ),
            json.dumps({"agse_equipment_number": "NOTAEQUIPNUM"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST,
        )

    def test_update_agse(self):
        """
        Checks that a request to update agse works
        """
        order_to_change = self.parts_orders[self.lowest_unit.uic]
        response = self.client.post(
            reverse(
                "update_parts_order",
                kwargs={"dod_document_number": order_to_change.dod_document_number},
            ),
            json.dumps({"agse_equipment_number": self.agse.equipment_number}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        order_to_change.refresh_from_db()
        self.assertEqual(order_to_change.agse, self.agse)
