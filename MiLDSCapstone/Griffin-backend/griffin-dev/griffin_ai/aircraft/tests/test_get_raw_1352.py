from datetime import date
from dateutil.relativedelta import relativedelta
from django.http import HttpRequest
from django.test import TestCase, tag
from django.urls import reverse
import json

from aircraft.models import Raw_DA_1352
from utils.tests import create_test_aircraft_in_all, create_single_test_unit


@tag("aircraft")
class GetRaw1352Test(TestCase):
    def setUp(self):
        """
        Set up common test artifacts used in the test cases.

        This method:
        - Creates main and sub units.
        - Assigns a subordinate UIC.
        - Creates aircraft records for the main and sub units.
        - Creates DA_1352 records with various reporting dates and links them to the units and aircraft.
        """
        self.unit = create_single_test_unit(
            uic="XX-000001",
            echelon="CO",
            short_name="Main Unit",
            display_name="Main Test Unit",
        )
        self.sub_unit = create_single_test_unit(
            uic="XX-000002",
            echelon="CO",
            short_name="Sub Unit",
            display_name="Sub Test Unit",
            parent_uic=self.unit,
        )

        # Assign subordinate uic
        self.unit.set_all_unit_lists()
        self.sub_unit.set_all_unit_lists()

        # Create Aircraft for the Units
        self.aircraft_main = create_test_aircraft_in_all(units=[self.unit])
        self.aircraft_sub = create_test_aircraft_in_all(units=[self.sub_unit])

        # Create DA_1352 records
        self.record_main = Raw_DA_1352.objects.create(
            serial_number=self.aircraft_main[0],
            reporting_uic=self.unit,
            reporting_month=date.today(),
            model_name="Test1",
            flying_hours=0,
            fmc_hours=0,
            field_hours=0,
            pmcm_hours=0,
            pmcs_hours=0,
            dade_hours=0,
            sust_hours=0,
            nmcs_hours=0,
            nmcm_hours=0,
            total_hours_in_status_per_month=0,
            total_reportable_hours_in_month=0,
            source="Test",
        )
        self.record_sub = Raw_DA_1352.objects.create(
            serial_number=self.aircraft_sub[0],
            reporting_uic=self.sub_unit,
            reporting_month=date.today() - relativedelta(years=1),
            model_name="Test",
            flying_hours=0,
            fmc_hours=0,
            field_hours=0,
            pmcm_hours=0,
            pmcs_hours=0,
            dade_hours=0,
            sust_hours=0,
            nmcs_hours=0,
            nmcm_hours=0,
            total_hours_in_status_per_month=0,
            total_reportable_hours_in_month=0,
            source="Test",
        )

    def test_uic_filtering(self):
        """
        Test the UIC (Unit Identification Code) filtering of the get_raw_1352 function.
        This test validates that:
        - The response includes DA_1352 records for the requested UIC.
        - DA_1352 records for subordinate UICs are also included in the response.

        Expected outcomes:
        - The serial numbers of records for both the main unit and its subordinate should be present in the response.
        """
        # Use Django's reverse function to construct the URL path for the function.
        url = reverse("get_raw_1352", args=[self.unit.uic])

        # Use the test client to perform the GET request.
        response = self.client.get(url)

        # Ensure both main and sub unit records are in the response
        self.assertEqual(
            True,
            any(
                da_1352["serial_number"] == self.record_main.serial_number.serial
                for da_1352 in json.loads(response.content)
            ),
        )
        self.assertEqual(
            True,
            any(
                da_1352["serial_number"] == self.record_sub.serial_number.serial
                for da_1352 in json.loads(response.content)
            ),
        )

    def test_date_range_filtering(self):
        """
        Test the date range filtering of the get_raw_1352 function.
        This test validates that:
        - When start_date and end_date are provided, the function filters the DA_1352 records based on the reporting_month within that range.

        Expected outcomes:
        - Only DA_1352 records with a reporting_month within the specified range should be included in the response.
        - The record for the sub unit, which has a reporting_month outside of the range, should not be present in the response.

        """
        request = HttpRequest()

        # Set dates to filter only the main unit's record -> this should exclude sub unit
        start_date = date.today()
        end_date = date.today()
        # Use Django's reverse function to construct the URL path for the function.
        url = reverse("get_raw_1352", args=[self.unit.uic, start_date, end_date])

        # Use the test client to perform the GET request.
        response = self.client.get(url)

        # Ensure only main unit record is in the response
        self.assertEqual(
            True,
            any(
                da_1352["serial_number"] == self.record_main.serial_number.serial
                for da_1352 in json.loads(response.content)
            ),
        )

        # sub unit should not be included bc reporting period is out of date range
        self.assertEqual(
            False,
            any(
                da_1352["serial_number"] == self.record_sub.serial_number.serial
                for da_1352 in json.loads(response.content)
            ),
        )
