from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_LANE_ALREADY_EXISTS,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)
from utils.tests import create_single_test_lane, create_single_test_unit


@tag("phase_sched", "create_phase_lane")
class AddLaneViewTests(TestCase):
    # Initial setup for Add Lane to Phase Lanes endpoint functionality.
    # - creating the needed models
    json_content = "application/json"

    def setUp(self):
        self.unit = create_single_test_unit(echelon="CO")

        self.existing_lane = create_single_test_lane(id=4, unit=self.unit, name="Existing Lane")

    def test_create_phase_lane_via_http_post(self):
        """
        Checks that the phase lane is being added correctly
        Receives UIC and Lane Name Parameters
        """
        url = reverse("create_phase_lane")
        data = {"uic": self.unit.uic, "lane_name": "Test Lane Name"}

        response = self.client.post(url, data, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Lane Added Successfully")

    def test_create_phase_lane_with_no_uic(self):
        """
        Checks that the correct response is issued when attempting to add a phase lane
        without a UIC.
        """
        url = reverse("create_phase_lane")
        data = {"lane_name": "Test Lane Name"}

        response = self.client.post(url, data, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
        )

    def test_create_phase_lane_with_no_lane_name(self):
        """
        Checks that the correct response is issued when attempting to add a phase lane
        without a name
        """
        url = reverse("create_phase_lane")
        data = {"uic": self.unit.uic}

        response = self.client.post(url, data, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
        )

    def test_create_phase_lane_with_invalid_unit(self):
        """
        Checks that the correct response is issued when attempting to add a phase lane with
        an invalid unit
        """
        unit = "NOT" + self.unit.uic
        url = reverse("create_phase_lane")
        data = {"uic": unit, "lane_name": "Test Lane Name"}

        response = self.client.post(url, data, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_create_phase_lane_when_lane_already_exists(self):
        """
        Checks that the correct repsonse is issued when attempting to duplicate a lane
        that already exists
        """
        url = reverse("create_phase_lane")
        data = {"uic": self.unit.uic, "lane_name": "Existing Lane"}

        response = self.client.post(url, data, content_type=self.json_content)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LANE_ALREADY_EXISTS)
