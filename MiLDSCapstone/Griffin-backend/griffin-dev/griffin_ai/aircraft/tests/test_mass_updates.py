from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone
from http import HTTPStatus
import json

from aircraft.models import Aircraft, AircraftEditLog
from aircraft.model_utils import AircraftStatuses
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_AIRCRAFT_STATUS_IS_INVALID,
    HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_RTL_IS_INVALID,
)
from utils.tests import (
    create_test_aircraft_in_all,
    create_test_units,
    create_test_user,
    create_test_location,
    get_default_top_unit,
)


@tag("aircraft", "mass_update")
class MassUpdateAircraftViewTests(TestCase):
    # Initial setup for Mass Update Aircraft endpoint functionality.
    # - creating the needed models
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.user = create_test_user(unit=self.top_unit)

        self.location_1 = create_test_location()

        self.location_2 = create_test_location()

        self.aircraft = create_test_aircraft_in_all([self.top_unit], num_of_aircraft=10)

    # Tests for Mass Update Aircraft endpoint.
    def test_mass_update_with_no_user_id_in_header(self):
        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_mass_update_with_invalid_user_id(self):
        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_mass_update_with_missing_serials_data(self):
        new_data = AircraftStatuses.FMC

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "update_field": "Status",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
        )

    def test_mass_update_with_missing_update_field(self):
        test_serials = self.aircraft[0].serial
        new_data = "NOT" + AircraftStatuses.FMC

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
        )

    def test_mass_update_with_missing_update_data(self):
        test_serials = self.aircraft[0].serial

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "Status",
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
        )

    def test_mass_update_with_non_post_request(self):
        response = self.client.get(
            reverse(
                "mass_aircraft_updates",
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)

    def test_mass_update_with_invalid_aircraft_status(self):
        test_serials = self.aircraft[0].serial
        new_data = "NOT" + AircraftStatuses.FMC

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "Status",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_AIRCRAFT_STATUS_IS_INVALID,
        )

    def test_mass_update_with_non_existent_location(self):
        test_serials = self.aircraft[0].serial
        new_data = -1

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "Location",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)

    def test_mass_update_with_invalid_rtl(self):
        test_serials = self.aircraft[0].serial
        new_data = "NOTRTL"

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "RTL",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_RTL_IS_INVALID)

    def test_mass_update_rtl_with_single_aircraft_to_update(self):
        test_serials = self.aircraft[0].serial
        new_data = "NRTL"

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "RTL",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Mass saves successful.")

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.filter(serial__in=[test_serials])

        # Asserting aircraft models were updated.
        for aircraft in self.aircraft:
            self.assertEqual(aircraft.rtl, new_data)

        # Asserting Aircraft Edit Logs.
        all_logs = AircraftEditLog.objects.all()

        for log in all_logs:
            self.assertEqual(log.user_id, self.user)

        self.assertEqual(len(all_logs), 1)  # 1 is expected as that is the current number of aircraft to be updated.

    def test_mass_update_rtl_with_multiple_aircraft_to_update(self):
        test_serials = [aircraft.serial for aircraft in self.aircraft[:5]]
        new_data = "NRTL"

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "RTL",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Mass saves successful.",
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.filter(serial__in=test_serials)

        # Asserting aircraft models were updated.
        for aircraft in self.aircraft:
            self.assertEqual(aircraft.rtl, new_data)

        # Asserting Aircraft Edit Logs.
        all_logs = AircraftEditLog.objects.all()

        for log in all_logs:
            self.assertEqual(log.user_id, self.user)

        self.assertEqual(len(all_logs), 5)  # 5 is expected as that is the current number of aircraft to be updated.

    def test_mass_update_location_with_single_aircraft_to_update(self):
        test_serials = self.aircraft[0].serial
        new_data = self.location_2

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "Location",
                    "update_data": new_data.id,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Mass saves successful.")

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.filter(serial__in=[test_serials])

        # Asserting aircraft models were updated.
        for aircraft in self.aircraft:
            self.assertEqual(aircraft.location, new_data)

        # Asserting Aircraft Edit Logs.
        all_logs = AircraftEditLog.objects.all()

        for log in all_logs:
            self.assertEqual(log.user_id, self.user)

        self.assertEqual(len(all_logs), 1)  # 1 is expected as that is the current number of aircraft to be updated.

    def test_mass_update_location_with_multiple_aircraft_to_update(self):
        test_serials = [aircraft.serial for aircraft in self.aircraft[:5]]
        new_data = self.location_2

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "Location",
                    "update_data": new_data.id,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Mass saves successful.",
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.filter(serial__in=test_serials)

        # Asserting aircraft models were updated.
        for aircraft in self.aircraft:
            self.assertEqual(aircraft.location, new_data)

        # Asserting Aircraft Edit Logs.
        all_logs = AircraftEditLog.objects.all()

        for log in all_logs:
            self.assertEqual(log.user_id, self.user)

        self.assertEqual(len(all_logs), 5)  # 5 is expected as that is the current number of aircraft to be updated.

    def test_mass_update_status_with_single_aircraft_to_update(self):
        test_serials = self.aircraft[0].serial
        new_data = AircraftStatuses.PMC

        test_time = timezone.now()

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "Status",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Mass saves successful.")

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.filter(serial__in=[test_serials])

        # Asserting aircraft models were updated.
        for aircraft in self.aircraft:
            self.assertEqual(aircraft.status, new_data)
            # The microsends will differ between the test creation and the endpoint execution, so instead of asserting
            # each part of the time (year, month, day, hour, minute, second), setting micro to 0 holds a robust assert.
            self.assertEqual(aircraft.last_update_time, test_time.replace(microsecond=0))

        # Asserting Aircraft Edit Logs.
        all_logs = AircraftEditLog.objects.all()

        for log in all_logs:
            self.assertEqual(log.user_id, self.user)

        self.assertEqual(len(all_logs), 1)  # 1 is expected as that is the current number of aircraft to be updated.

    def test_mass_update_status_with_multiple_aircraft_to_update(self):
        test_serials = [aircraft.serial for aircraft in self.aircraft[:5]]

        new_data = AircraftStatuses.PMC

        test_time = timezone.now()

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "Status",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Mass saves successful.",
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.filter(serial__in=test_serials)

        # Asserting aircraft models were updated.
        for aircraft in self.aircraft:
            self.assertEqual(aircraft.status, new_data)
            # The microsends will differ between the test creation and the endpoint execution, so instead of asserting
            # each part of the time (year, month, day, hour, minute, second), setting micro to 0 holds a robust assert.
            self.assertEqual(aircraft.last_update_time, test_time.replace(microsecond=0))

        # Asserting Aircraft Edit Logs.
        all_logs = AircraftEditLog.objects.all()

        for log in all_logs:
            self.assertEqual(log.user_id, self.user)

        self.assertEqual(len(all_logs), 5)  # 5 is expected as that is the current number of aircraft to be updated.

    def test_mass_update_remarks(self):
        test_serials = [aircraft.serial for aircraft in self.aircraft[:5]]

        new_data = "New remarks for this test"

        test_time = timezone.now()

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "Remarks",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Mass saves successful.",
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.filter(serial__in=test_serials)

        # Asserting aircraft models were updated.
        for aircraft in self.aircraft:
            self.assertEqual(aircraft.remarks, new_data)
            # The microsends will differ between the test creation and the endpoint execution, so instead of asserting
            # each part of the time (year, month, day, hour, minute, second), setting micro to 0 holds a robust assert.
            self.assertEqual(aircraft.last_update_time, test_time.replace(microsecond=0))

        # Asserting Aircraft Edit Logs.
        all_logs = AircraftEditLog.objects.all()

        for log in all_logs:
            self.assertEqual(log.user_id, self.user)

        self.assertEqual(len(all_logs), 5)  # 5 is expected as that is the current number of aircraft to be updated.

    def test_mass_update_should_sync(self):
        test_serials = [aircraft.serial for aircraft in self.aircraft[:5]]

        new_data = False

        test_time = timezone.now()

        response = self.client.post(
            reverse(
                "mass_aircraft_updates",
            ),
            json.dumps(
                {
                    "serials": test_serials,
                    "update_field": "should_sync",
                    "update_data": new_data,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Mass saves successful.",
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.filter(serial__in=test_serials)

        # Asserting aircraft models were updated.
        for aircraft in self.aircraft:
            self.assertEqual(aircraft.should_sync, new_data)
            # The microsends will differ between the test creation and the endpoint execution, so instead of asserting
            # each part of the time (year, month, day, hour, minute, second), setting micro to 0 holds a robust assert.
            self.assertEqual(aircraft.last_update_time, test_time.replace(microsecond=0))

        # Asserting Aircraft Edit Logs.
        all_logs = AircraftEditLog.objects.all()

        for log in all_logs:
            self.assertEqual(log.user_id, self.user)

        self.assertEqual(len(all_logs), 5)  # 5 is expected as that is the current number of aircraft to be updated.
