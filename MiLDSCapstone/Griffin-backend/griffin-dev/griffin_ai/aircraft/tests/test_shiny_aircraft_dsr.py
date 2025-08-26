from django.http import JsonResponse
from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from aircraft.models import Aircraft
from utils.tests import (
    create_test_units,
    create_test_aircraft_in_all,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@tag("aircraft", "shiny_aircraft_dsr")
class ShinyAircraftDSRViewTestCase(TestCase):
    def setUp(self):
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BDE",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.aircraft = create_test_aircraft_in_all(self.units_created)

        self.unit_aircraft = {}

        for unit in self.units_created:
            self.unit_aircraft[unit.uic] = Aircraft.objects.filter(current_unit=unit).values_list("serial", flat=True)

        self.aircraft_created = [aircraft.serial for aircraft in self.aircraft]

    def test_invalid_unit_uic(self):
        # Get the test bde uic
        bde_uic = list(self.uic_hierarchy)[0]
        # Request the battalion
        res = self.client.get(reverse("shiny_aircraft_dsr", kwargs={"uic": "NOT" + bde_uic}))
        # Assert expected response
        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(res.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def is_valid_json_response(self, res):
        """
        Helper function to validate the response is valid (200) and a JsonResponse type

        @param res : (django.http.response.Response) the response object
        """
        self.assertEqual(200, res.status_code, "Invalid HTTP response")
        self.assertEqual(type(res), JsonResponse, "Response is not valid JsonResponse")

    def test_includes_aircraft_and_inspections(self):
        """
        Every Response should contain both Aircraft and Inspection lists
        """
        bde_uic = list(self.uic_hierarchy)[0]
        res = self.client.get(reverse("shiny_aircraft_dsr", kwargs={"uic": bde_uic}))
        self.is_valid_json_response(res)
        response_data = res.json()
        self.assertIn("aircraft", response_data)
        self.assertIn("inspections", response_data)
        self.assertEqual(type(response_data["aircraft"]), list)
        self.assertEqual(type(response_data["inspections"]), list)

    def test_bde_req_gets_all_aircraft(self):
        """
        The response for a requested Brigade should include all aircraft
        assigned to its subordinate units
        """
        # Get the test bde uic
        bde_uic = list(self.uic_hierarchy)[0]
        # Request the battalion
        res = self.client.get(reverse("shiny_aircraft_dsr", kwargs={"uic": bde_uic}))
        self.is_valid_json_response(res)
        # Convert the response to a python dictionary
        bde_data = res.json()
        aircraft_returned = aircraft_returned = [aircraft["serial"] for aircraft in bde_data["aircraft"]]
        self.assertCountEqual(
            self.aircraft_created,
            aircraft_returned,
            "Response did not match all aircraft created",
        )

    def test_co_req_gets_only_its_aircraft(self):
        """
        The response for a requested Company should include only its aircraft
        """
        bde_uic = list(self.uic_hierarchy)[0]
        for bn_uic in self.uic_hierarchy[bde_uic]:
            for co_uic in self.uic_hierarchy[bn_uic]:
                # Request the company data
                res = self.client.get(reverse("shiny_aircraft_dsr", kwargs={"uic": co_uic}))
                self.is_valid_json_response(res)
                # Convert the response to a python dictionary
                co_data = res.json()
                aircraft_returned = [aircraft["serial"] for aircraft in co_data["aircraft"]]
                self.assertCountEqual(
                    self.unit_aircraft[co_uic],
                    aircraft_returned,
                    "Response did not include Company Aircraft",
                )
