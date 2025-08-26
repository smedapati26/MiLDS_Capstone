from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from utils.tests import (
    create_test_units,
    create_test_aircraft_in_all,
    create_lanes_in_all,
    create_phases_in_all,
)

from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@tag("phase_sched", "get_phases")
class GetPhasesTests(TestCase):
    # Initial setup for Get Phases endpoint functionality
    # - creating the needed models

    def setUp(self):
        # Create the units
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        # Create the aircraft
        self.aircraft_created = create_test_aircraft_in_all(self.units_created)

        self.lanes_created = create_lanes_in_all(self.units_created)

        self.phases_created = create_phases_in_all(self.aircraft_created, self.lanes_created)

        self.expected_data = []
        for item in self.phases_created:
            data = {
                "id": item.id,
                "aircraft": item.aircraft.serial,
                "aircraft__model": item.aircraft.model,
                "phase_type": item.phase_type,
                "lane__unit": item.lane.unit.uic,
                "lane__name": item.lane.name,
                "lane__id": item.lane.id,
                "start_date": item.start_date.strftime("%Y-%m-%d"),
                "end_date": item.end_date.strftime("%Y-%m-%d"),
            }
            self.expected_data.append(data)

    def test_get_phases(self):
        """
        Checks that the correct response and data are returned when attempting to retrieve the phase
        information from the desired unit
        """
        uic = "TEST000AA"
        url = reverse("get_phases", kwargs={"uic": uic})
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.OK)

        returned_phases = json.loads(response.content)
        self.assertCountEqual(returned_phases["phases"], self.expected_data)

    def test_get_phases_with_no_aircraft_returned(self):
        uic = "NOT"
        url = reverse("get_phases", kwargs={"uic": uic})

        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
