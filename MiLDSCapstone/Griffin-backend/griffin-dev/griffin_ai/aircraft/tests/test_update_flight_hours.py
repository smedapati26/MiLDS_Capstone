from django.test import TestCase, tag
from datetime import date, datetime

from aircraft.views.transforms.update_flight_hours import update_flight_hours
from utils.time import get_reporting_period


@tag("aircraft")
class WithinReportingPeriodTestCase(TestCase):
    def test_standard_update(self):
        today = date(2023, 9, 26)
        period = get_reporting_period(today)
        current_hours = 10.5
        new_hours = 11.5
        current_last_sync = datetime(2023, 9, 25, 1, 0, 0, 0)
        new_last_sync = datetime(2023, 9, 26, 0, 0, 0)
        self.assertEqual(
            update_flight_hours(
                period,
                today,
                current_hours,
                new_hours,
                current_last_sync,
                new_last_sync,
            ),
            11.5,
        )

    def test_user_provided_higher_value(self):
        today = date(2023, 9, 26)
        period = get_reporting_period(today)
        current_hours = 15.5
        new_hours = 11.5
        current_last_sync = datetime(2023, 9, 25, 1, 0, 0, 0)
        new_last_sync = datetime(2023, 9, 26, 0, 0, 0)
        self.assertEqual(
            update_flight_hours(
                period,
                today,
                current_hours,
                new_hours,
                current_last_sync,
                new_last_sync,
            ),
            15.5,
        )

    def test_new_update_in_new_period(self):
        today = date(2023, 9, 26)
        period = get_reporting_period(today)
        current_hours = 15.5
        new_hours = 11.5
        current_last_sync = datetime(2023, 9, 1, 1, 0, 0, 0)
        new_last_sync = datetime(2023, 9, 26, 0, 0, 0)
        self.assertEqual(
            update_flight_hours(
                period,
                today,
                current_hours,
                new_hours,
                current_last_sync,
                new_last_sync,
            ),
            11.5,
        )

    def test_no_sync_in_current_reporting_period(self):
        today = date(2023, 9, 26)
        period = get_reporting_period(today)
        current_hours = 15.5
        new_hours = 11.5
        current_last_sync = datetime(2023, 9, 1, 1, 0, 0, 0)
        new_last_sync = datetime(2023, 9, 6, 0, 0, 0)
        self.assertEqual(
            update_flight_hours(
                period,
                today,
                current_hours,
                new_hours,
                current_last_sync,
                new_last_sync,
            ),
            15.5,
        )

    def test_no_sync_in_current_reporting_period_on_15th(self):
        today = date(2023, 10, 15)
        period = get_reporting_period(today)
        current_hours = 15.5
        new_hours = 11.5
        current_last_sync = datetime(2023, 9, 1, 1, 0, 0, 0)
        new_last_sync = datetime(2023, 9, 6, 0, 0, 0)
        self.assertEqual(
            update_flight_hours(
                period,
                today,
                current_hours,
                new_hours,
                current_last_sync,
                new_last_sync,
            ),
            0.0,
        )
