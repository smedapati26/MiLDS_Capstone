from django.http import JsonResponse
from django.test import TestCase, tag

from aircraft.models import Aircraft
from utils.tests import create_test_aircraft_in_all, create_test_units


@tag("auto_dsr", "aircraft_module")
class AircraftModuleViewTestCase(TestCase):
    def setUp(self):
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BDE",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.aircraft = create_test_aircraft_in_all(self.units_created, echelon_dependant=True)

        self.unit_aircraft = {}

        for unit in self.units_created:
            self.unit_aircraft[unit.uic] = Aircraft.objects.filter(current_unit=unit).values_list("serial", flat=True)

        self.aircraft_created = [aircraft.serial for aircraft in self.aircraft]
        self.base_url = "/auto_dsr/modules/aircraft/"

    def is_valid_json_response(self, res):
        """
        Helper function to validate the response is valid (200) and a JsonResponse type

        @param res : (django.http.response.HttpResponse) the response object
        """
        self.assertEqual(200, res.status_code, "Invalid HTTP response")
        self.assertEqual(type(res), JsonResponse, "Response is not valid JsonResponse")

    def response_includes_sub_units(self, uic: str):
        """
        Helper function to request a unit and check it includes its immediate subordinate units

        @param uic : (str) the uic to request the unit for
        """
        # Request the unit
        res = self.client.get(f"{self.base_url}{uic}")
        self.is_valid_json_response(res)
        # Convert the response to a python dictionary
        bde_data = res.json()
        # Get the uics returned
        sub_uics = [unit["uic"] for unit in bde_data["sub_units"]]
        self.assertCountEqual(
            list(self.uic_hierarchy[uic]),
            sub_uics,
            "Response did not include the subordinate units",
        )

    def test_bde_request_returns_bns(self):
        """
        A request for a unit should return only the immediate subordinate units of that unit with all aircraft assigned
        """
        # Get the test bde uic
        bde_uic = list(self.uic_hierarchy)[0]
        self.response_includes_sub_units(bde_uic)

    def test_bn_request_returns_cos(self):
        """
        A request for a battalion should return its subordinate companies
        """
        # Get the test bde uic
        bde_uic = list(self.uic_hierarchy)[0]
        for bn_uic in self.uic_hierarchy[bde_uic]:
            self.response_includes_sub_units(bn_uic)

    def test_co_request_contains_only_itself(self):
        """
        A request for a company should not have any subordinate units
        """
        # Get the test bde uic
        bde_uic = list(self.uic_hierarchy)[0]
        for bn_uic in self.uic_hierarchy[bde_uic]:
            for co_uic in self.uic_hierarchy[bn_uic]:
                # Request the company data
                res = self.client.get(f"{self.base_url}{co_uic}")
                self.is_valid_json_response(res)
                # Convert the response to a python dictionary
                co_data = res.json()
                self.assertEqual(0, len(co_data["sub_units"]))

    def test_bde_req_gets_all_aircraft(self):
        """
        The response for a requested Brigade should include all aircraft
        assigned to its subordinate units
        """
        # Get the test bde uic
        bde_uic = list(self.uic_hierarchy)[0]
        # Request the battalion
        res = self.client.get(f"{self.base_url}{bde_uic}")
        self.is_valid_json_response(res)
        # Convert the response to a python dictionary
        bde_data = res.json()
        aircraft_returned = [aircraft["serial"] for unit in bde_data["sub_units"] for aircraft in unit["aircraft"]]
        self.assertCountEqual(
            self.aircraft_created[1:],
            aircraft_returned,
            "Response did not match all aircraft created",
        )
        # Aircraft should be returned in their subordinate units;
        # The [0]th aircraft created is from a Unit that is not a Compnay, and should not not be returned.

    def test_co_req_gets_only_its_aircraft(self):
        """
        The response for a requested Company should include only its aircraft
        """
        bde_uic = list(self.uic_hierarchy)[0]
        for bn_uic in self.uic_hierarchy[bde_uic]:
            for co_uic in self.uic_hierarchy[bn_uic]:
                # Request the company data
                res = self.client.get(f"{self.base_url}{co_uic}")
                self.is_valid_json_response(res)
                # Convert the response to a python dictionary
                co_data = res.json()
                aircraft_returned = [aircraft["serial"] for aircraft in co_data["aircraft"]]
                self.assertCountEqual(
                    self.unit_aircraft[co_uic],
                    aircraft_returned,
                    "Response did not include Company Aircraft",
                )
