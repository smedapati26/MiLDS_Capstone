from auto_dsr.models import Location

from auto_dsr.utils import create_location_fields


def generate_all_location_short_names_and_abbreviations():
    # Retrieve all Location objects
    locations = Location.objects.all()

    # Generate all the short names and abbrevaitions
    for location in locations:
        create_location_fields(location)
