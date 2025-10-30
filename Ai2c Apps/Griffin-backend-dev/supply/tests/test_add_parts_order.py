import json

from django.test import TestCase, tag
from django.urls import reverse

from supply.models import PartsOrder
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)
from utils.tests import (
    create_single_test_agse,
    create_single_test_aircraft,
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("supply", "add_parts_order")
class AddSupplyViewTest(TestCase):
    def setUp(self):
        # Create a test unit
        self.units, self.hierarchy = create_test_units()
        self.highest_hq = get_default_top_unit()
        self.lowest_unit = get_default_bottom_unit()
        # create some aircraft and agse
        self.aircraft = create_single_test_aircraft(current_unit=self.lowest_unit)
        self.agse = create_single_test_agse(current_unit=self.lowest_unit)

    def test_add_with_invalid_method(self):
        """
        Checks that a add part order method used is correct
        """
        response = self.client.get(
            reverse(
                "add_parts_order",
                kwargs={"dod_document_number": "WINVALID"},
            )
        )
        self.assertEqual(response.status_code, 405)

    def test_add_with_no_uic_details(self):
        """
        Checks the part order cannot be created without a uic
        """
        response = self.client.post(
            reverse(
                "add_parts_order",
                kwargs={"dod_document_number": "WINVALID"},
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
        )

    def test_add_with_minimal_details(self):
        """
        Checks the part order can be created with minimal information
        """
        doc_num = "WTEST0001"
        response = self.client.post(
            reverse(
                "add_parts_order",
                kwargs={"dod_document_number": doc_num},
            ),
            json.dumps({"uic": self.highest_hq.uic}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        created_order = PartsOrder.objects.get(dod_document_number=doc_num)
        self.assertEqual(created_order.unit, self.highest_hq)
        self.assertTrue(created_order.is_visible)

    def test_add_with_invalid_uic(self):
        """
        Checks the part order can be created with minimal information
        """
        doc_num = "WTEST0001"
        response = self.client.post(
            reverse(
                "add_parts_order",
                kwargs={"dod_document_number": doc_num},
            ),
            json.dumps({"uic": "INVALID"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
        )

    def test_add_with_all_details(self):
        """
        Checks the part order can be created with minimal information
        """
        doc_num = "WTEST0001"
        carrier = "UPS"
        carrier_tracking_number = "012345"
        aircraft = self.aircraft
        is_visible = False
        response = self.client.post(
            reverse(
                "add_parts_order",
                kwargs={"dod_document_number": doc_num},
            ),
            json.dumps(
                {
                    "uic": self.highest_hq.uic,
                    "carrier": carrier,
                    "carrier_tracking_number": carrier_tracking_number,
                    "aircraft_serial_number": aircraft.serial,
                    "is_visible": is_visible,
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        created_order = PartsOrder.objects.get(dod_document_number=doc_num)
        self.assertEqual(created_order.unit, self.highest_hq)
        self.assertEqual(created_order.carrier, carrier)
        self.assertEqual(created_order.carrier_tracking_number, carrier_tracking_number)
        self.assertEqual(created_order.aircraft, aircraft)
        self.assertFalse(created_order.is_visible)
