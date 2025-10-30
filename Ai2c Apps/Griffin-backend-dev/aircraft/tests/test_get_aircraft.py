import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.tests import create_test_aircraft_in_all, create_test_units


@tag("aircraft", "get_aircraft")
class GetAircraftTests(TestCase):
    # Initial setup for Get Aircraft Inspections endpoint functionality.
    # - creating the needed models

    def setUp(self):
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.unit_aircraft = create_test_aircraft_in_all(self.units_created)

        self.aircraft_created = set([aircraft.serial for aircraft in self.unit_aircraft])

    def test_get_aircraft(self):
        """
        Checks that the correct response is issued when attempting to retrieve aircraft from a uic.
        """
        uic = "TEST000AA"
        url = reverse("get_aircraft", kwargs={"uic": uic})

        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        returned_serial_numbers = json.loads(response.content)
        self.assertCountEqual(returned_serial_numbers["aircraft"], self.aircraft_created)

    def test_get_aircraft_with_invalid_unit(self):
        """
        Checks that the correct response is issued when attempting to retrieve aricraft with an
        invalid uic
        """
        uic = "NOT"
        url = reverse("get_aircraft", kwargs={"uic": uic})

        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), '{"aircraft": []}')
