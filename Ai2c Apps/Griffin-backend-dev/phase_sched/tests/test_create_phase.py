from datetime import timedelta
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)
from utils.tests import create_single_test_aircraft, create_single_test_lane, create_single_test_unit


@tag("phase_sched", "create_phase")
class AddPhaseViewTests(TestCase):
    json_content = "application/json"

    # Initial setup for Add Phase to Phases endpoint functionality.
    # - creating the needed models
    def setUp(self):
        self.unit = create_single_test_unit(echelon="CO")

        self.phase_lane = create_single_test_lane(unit=self.unit)

        self.aircraft = create_single_test_aircraft(current_unit=self.unit)

    def test_create_phase_via_http_post(self):
        """
        Checks that the phase is being added correctly via HTTP
        Receives lane_id, aircraft_serial, phase_type, start_date, end_date
        """
        url = reverse("create_phase")
        start = timezone.now()
        end = timezone.now() + timedelta(days=30)
        data = {
            "lane_id": self.phase_lane.id,
            "aircraft": self.aircraft.serial,
            "phase_type": "TEST",
            "start": start.date(),
            "end": end.date(),
        }

        response = self.client.post(url, data, content_type=self.json_content)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Phase Added Successfully")

    def test_create_phase_with_no_lane(self):
        """
        Checks that the correct response is issued when attempting to create a phase without
        a phase lane in the json body
        """
        url = reverse("create_phase")
        start = timezone.now()
        end = timezone.now() + timedelta(days=30)
        data = {
            "aircraft": self.aircraft.serial,
            "phase_type": "Test",
            "start_date": start.date(),
            "end_date": end.date(),
        }

        response = self.client.post(url, data, content_type=self.json_content)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
        )

    def test_create_phase_with_no_aircraft(self):
        """
        Checks that the correct response is issued when attempting to create a phase lane without
        an aircraft in the json body
        """
        url = reverse("create_phase")
        start = timezone.now()
        end = timezone.now() + timedelta(days=30)
        data = {
            "lane_id": self.phase_lane.id,
            "phase_type": "Test",
            "start_date": start.date(),
            "end_date": end.date(),
        }

        response = self.client.post(url, data, content_type=self.json_content)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
        )

    def test_create_phase_with_invalid_phase_lane(self):
        """
        Checks that the correct response is issued when attempting to
        create a phase with an invalid phase_lane
        """
        lane_id = -1
        url = reverse("create_phase")
        start = timezone.now()
        end = timezone.now() + timedelta(days=30)
        data = {
            "lane_id": lane_id,
            "aircraft": self.aircraft.serial,
            "phase_type": "Test",
            "start_date": start.date(),
            "end_date": end.date(),
        }

        response = self.client.post(url, data, content_type=self.json_content)
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST)

    def test_create_phase_with_invalid_aricraft(self):
        """
        Checks that the correct response is issued when attempting to
        create a phase with an invalid aircraft
        """
        url = reverse("create_phase")
        start = timezone.now()
        end = timezone.now() + timedelta(days=30)
        data = {
            "lane_id": self.phase_lane.id,
            "aircraft": "NOT" + self.aircraft.serial,
            "phase_type": "Test",
            "start_date": start.date(),
            "end_date": end.date(),
        }

        response = self.client.post(url, data, content_type=self.json_content)
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)
