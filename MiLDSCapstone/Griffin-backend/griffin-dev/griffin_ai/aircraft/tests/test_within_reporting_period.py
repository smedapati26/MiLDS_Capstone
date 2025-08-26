from django.test import TestCase, tag
from datetime import date, datetime

from utils.time import get_reporting_period, within_reporting_period


@tag("aircraft")
class WithinReportingPeriodTestCase(TestCase):
    def test_simple_periods(self):
        period = get_reporting_period(date(2023, 9, 1))
        in_period_time = datetime(2023, 9, 10, 0, 0, 0, 0)
        start_time = datetime(2023, 8, 16, 0, 0, 0, 0)
        last_possible_second = datetime(2023, 9, 15, 23, 59, 59)
        self.assertTrue(within_reporting_period(period, in_period_time))
        self.assertTrue(within_reporting_period(period, start_time))
        self.assertTrue(within_reporting_period(period, last_possible_second))

        too_early = datetime(2023, 7, 1, 0, 0, 0, 0)
        self.assertFalse(within_reporting_period(period, too_early))

        too_late = datetime(2023, 10, 1, 0, 0, 0, 0)
        self.assertFalse(within_reporting_period(period, too_late))

    def test_new_year_logic(self):
        period = get_reporting_period(date(2024, 1, 1))
        in_period_time = datetime(2023, 12, 28, 0, 0, 0, 0)
        start_time = datetime(2023, 12, 16, 0, 0, 0, 0)
        last_possible_second = datetime(2024, 1, 15, 23, 59, 59)
        self.assertTrue(within_reporting_period(period, in_period_time))
        self.assertTrue(within_reporting_period(period, start_time))
        self.assertTrue(within_reporting_period(period, last_possible_second))

        too_early = datetime(2023, 7, 1, 0, 0, 0, 0)
        self.assertFalse(within_reporting_period(period, too_early))

        too_late = datetime(2024, 10, 1, 0, 0, 0, 0)
        self.assertFalse(within_reporting_period(period, too_late))
