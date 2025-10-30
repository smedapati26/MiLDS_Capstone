from datetime import date

from django.test import TestCase, tag

from utils.time import get_reporting_period


@tag("aircraft")
class CurrentReportingPeriodTestCase(TestCase):
    def test_simple_periods(self):
        start_date, end_date = get_reporting_period(date(2023, 9, 1))
        self.assertEqual(start_date, date(2023, 8, 16))
        self.assertEqual(end_date, date(2023, 9, 15))

        start_date, end_date = get_reporting_period(date(2023, 9, 20))
        self.assertEqual(start_date, date(2023, 9, 16))
        self.assertEqual(end_date, date(2023, 10, 15))

    def test_new_year_logic(self):
        start_date, end_date = get_reporting_period(date(2024, 1, 1))
        self.assertEqual(start_date, date(2023, 12, 16))
        self.assertEqual(end_date, date(2024, 1, 15))

        start_date, end_date = get_reporting_period(date(2023, 12, 20))
        self.assertEqual(start_date, date(2023, 12, 16))
        self.assertEqual(end_date, date(2024, 1, 15))
