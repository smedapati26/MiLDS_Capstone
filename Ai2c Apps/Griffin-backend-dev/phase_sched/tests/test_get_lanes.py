import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.models import Unit
from phase_sched.models import PhaseLane
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import create_lanes_in_all, create_test_units


@tag("phase_sched", "get_lanes")
class GetLanesTests(TestCase):
    # Initial setup for Get Lanes endpoint functionality
    # - creating models

    def setUp(self):
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )
        self.lanes_created = {"lanes": create_lanes_in_all(self.units_created)}

    def test_get_lanes(self):
        """
        Checks that the correct response is issued when attempting to retrieve the lanes from the
        desired unit
        """
        uic = "TEST000AA"
        url = reverse("get_lanes", kwargs={"uic": uic})

        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        returned_lanes = json.loads(response.content)
        expected_lane_uics = [uic] + Unit.objects.get(uic=uic).subordinate_uics
        expected_lane = PhaseLane.objects.filter(unit__in=expected_lane_uics)
        self.assertEqual(returned_lanes["lanes"], list(expected_lane.values()))

    def test_get_lanes_with_invalid_unit(self):
        """
        Checks to see that the correct response is returned when attempting to retrieve lanes with an
        invalid unit
        """
        uic = "NOT"
        url = reverse("get_lanes", kwargs={"uic": uic})

        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
