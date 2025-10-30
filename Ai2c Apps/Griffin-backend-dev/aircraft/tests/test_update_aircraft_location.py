from django.test import TestCase, tag

from utils.tests import create_single_test_aircraft, create_single_test_unit, create_test_location
from utils.transform.update_aircraft_location import update_aircraft_location


@tag("aircraft", "transform")
class UpdateAircraftLocationTestCase(TestCase):
    def setUp(self):
        self.unit = create_single_test_unit()
        self.location_a = create_test_location()
        self.location_b = create_test_location(name="Location B", code="LC_B")
        self.aircraft = create_single_test_aircraft(self.unit, location=self.location_a)

    def test_no_location_update(self):
        location = update_aircraft_location(self.aircraft, None)
        self.assertEqual(location, self.location_a)

    def test_matching_code(self):
        location = update_aircraft_location(self.aircraft, self.location_b.code)
        self.assertEqual(location, self.location_b)

    def test_matching_name(self):
        location = update_aircraft_location(self.aircraft, self.location_b.name)
        self.assertEqual(location, self.location_b)
