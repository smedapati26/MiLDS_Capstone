from auto_dsr.models import Location


def create_location_fields(location: Location):
    """
    Creates location short_name and abbreviations from given names

    @param location: (auto_dsr.models.Location) the location to create the fields for
    """
    # Note: order matters
    # For example: to generate short name and abbreviation for "Test Royal Naval Air Station",
    # in the following list "Royal Naval Air Station" needs to be defined before "Naval Air Station".
    conversions = {
        "International Airport": "IA",
        "Army Airfield": "AAF",
        "Aerodrome": "AD",
        "Air Force Base": "AFB",
        "Air Force Station": "AFS",
        "Air Base": "AB",
        "Royal Naval Air Station": "RNAS",
        "Naval Air Station": "NAS",
        "Air and Space Port": "ASP",
        "Forward Operating Base": "FOB",
        "AirCenter": "AC",
        "Airbase": "AB",
        "Airfield": "AF",
        "Heliport": "HELI",
    }

    common_patterns = conversions.keys()

    current_pattern = None

    # The patterns with slashes are too complicated to do by code right now
    if "/" in location.name:
        return

    else:
        # Check for any "(...)" in a location's name, and store this as the alternate_name
        # No pattern is added to the text inside "(...)" as a majority of these cases already have the same or a different
        # pattern in the main location name string.
        if "(" in location.name:
            if location.name.endswith(")"):
                location.alternate_name = location.name[location.name.find("(") + 1 : location.name.find(")")].strip()
                location.name = location.name[: location.name.find("(")].strip()
            else:
                alt = location.name[location.name.find("(") + 1 : location.name.find(")")].strip()
                primary = location.name[: location.name.find("(")].strip()
                classifier = location.name[: location.name.find(")") + 1].strip()
                location.alternate_name = " ".join([alt, classifier])
                location.name = " ".join([primary, classifier])

    # Generate a shorter name using the common patterns list
    for pattern in common_patterns:
        if pattern in location.name:
            current_pattern = pattern
            break
        if location.alternate_name and pattern in location.alternate_name:
            current_pattern = pattern
            break

    if current_pattern:
        location.short_name = location.name.replace(current_pattern, conversions[current_pattern])

    # Generate the abbreviation for this location
    if location.short_name:
        location.abbreviation = "".join(char for char in location.short_name if (char.isupper() or char.isnumeric()))
    else:
        location.abbreviation = "".join(char for char in location.name if char.isupper() or char.isnumeric())

    try:
        location.save()
    except:
        print(vars(location))
