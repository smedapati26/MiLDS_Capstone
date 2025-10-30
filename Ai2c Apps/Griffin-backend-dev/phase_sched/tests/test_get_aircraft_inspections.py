import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST
from utils.tests import create_single_test_aircraft, create_single_test_unit


@tag("phase_sched", "get_aircraft_inspections")
class GetAircraftInspectionsTests(TestCase):
    # Initial setup for Get Aircraft Inspections endpoint functionality.
    # - creating the needed models
    json_content = "application/json"

    def setUp(self):
        # Unit
        self.unit = create_single_test_unit()

        # Generic Aircraft
        self.generic = create_single_test_aircraft(self.unit)

        # # Blackhawk
        self.blackhawk = create_single_test_aircraft(self.unit, serial="BLACKHAWK", model="UH-60M", mds="UH-60MX")

        # Chinook
        self.chinook = create_single_test_aircraft(self.unit, serial="CHINOOK", model="CH-47FM3", mds="CH-47FM3X")

        # Apache
        self.apache = create_single_test_aircraft(self.unit, serial="APACHE", model="AH-64E", mds="AH-64EX")

    def test_get_inspections_generic(self):
        """
        Checks that the correct response is issued when attempting to retrieve
        base inspection types from aircraft that are not currently contained within
        the phase types util models. Meaning any aircraft that is not a UH-60, CH-47 or AH-64.
        """
        url = reverse("get_aircraft_inspections", kwargs={"serial": self.generic.serial})
        response = self.client.get(url)
        expected_return_value = {"inspections": ["GEN", "DADE", "RESET"]}

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_return_value)

    def test_get_inspections_blackhawk(self):
        """
        Checks that the correct response is issued when attempting to retrieve
        inspections types assosciated with the UH-60 Blackhawk and its variants.
        """
        url = reverse("get_aircraft_inspections", kwargs={"serial": self.blackhawk.serial})
        response = self.client.get(url)
        expected_return_value = {"inspections": ["GEN", "DADE", "RESET", "480", "960", "48 Month"]}

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_return_value)

    def test_get_inspections_chinook(self):
        """
        Checks that the correct response is issued when attempting to retrieve
        inspections types assosciated with the CH-47 Chinook and its variants.
        """
        url = reverse("get_aircraft_inspections", kwargs={"serial": self.chinook.serial})
        response = self.client.get(url)
        expected_return_value = {"inspections": ["GEN", "DADE", "RESET", "320", "640", "1920"]}

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_return_value)

    def test_get_inspections_apache(self):
        """
        Checks that the correct response is issued when attempting to retrieve
        inspections types assosciated with the AH-64 Apache and its variants.
        """
        url = reverse("get_aircraft_inspections", kwargs={"serial": self.apache.serial})
        response = self.client.get(url)
        expected_return_value = {"inspections": ["GEN", "DADE", "RESET", "250", "500"]}

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(json.loads(response.content), expected_return_value)

    def test_get_inspections_with_invalid_aircraft(self):
        """
        Checks that the correct response is issued when attempting to retrieve
        inspections types with an invalid aircraft.
        """

        url = reverse("get_aircraft_inspections", kwargs={"serial": "INVALID"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)
