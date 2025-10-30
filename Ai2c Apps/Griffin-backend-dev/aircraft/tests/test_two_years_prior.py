from datetime import date

from django.test import TestCase, tag

from utils.time import two_years_prior


@tag("aircraft")
class TwoYearsPriorTestCase(TestCase):
    def test_non_leap_year(self):
        """
        Test if the function returns the correct date for non-leap years.
        """
        # Testing for a non-leap year date in January
        self.assertEqual(two_years_prior(date(2022, 1, 15)), date(2020, 1, 15))

        # Testing for a non-leap year date in December
        self.assertEqual(two_years_prior(date(2022, 12, 31)), date(2020, 12, 31))

    def test_end_date_on_or_after_feb_29_leap_year(self):
        """
        Test if the function returns Feb 29th of the year two years prior when
        the end_date is on or after Feb 29th in a leap year.
        """
        # Testing for a leap year date exactly on Feb 29th, expecting Feb 28th two years prior since 2022 is not a leap year
        self.assertEqual(two_years_prior(date(2024, 2, 29)), date(2022, 2, 28))

        # Testing for a leap year date after Feb 29th
        self.assertEqual(two_years_prior(date(2024, 3, 1)), date(2022, 3, 1))

    def test_end_date_before_feb_29_leap_year(self):
        """
        Test if the function returns a date with the same day and month but two years
        prior when the end_date is before Feb 29th in a leap year.
        """
        # Testing for a leap year date right before Feb 29th
        self.assertEqual(two_years_prior(date(2024, 2, 28)), date(2022, 2, 28))

    def test_end_date_on_feb_29_non_leap_year(self):
        """
        Test if the function returns Feb 28th of the year two years prior when
        the end_date is Feb 29th in a leap year.
        """
        # Testing for a scenario where the given date is Feb 29th of a leap year, so the expected result should be Feb 28th two years prior.
        self.assertEqual(two_years_prior(date(2020, 2, 29)), date(2018, 2, 28))
