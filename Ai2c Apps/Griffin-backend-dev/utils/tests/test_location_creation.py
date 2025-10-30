from aircraft.models import Location


def create_test_location(
    name: str = "Location",
    alternate_name: str | None = None,
    short_name: str | None = None,
    abbreviation: str | None = None,
    code: str = "LC",
) -> Location:
    """
    Creates a Location object.

    @param name: (str) The location name value for the new Location
    @param code: (str) The airport code value for the new Location

    @returns (Location)
            The newly created Location object.
    """
    current_num_of_locations = str(Location.objects.count())

    return Location.objects.create(
        name=name + " " + current_num_of_locations,
        alternate_name=alternate_name,
        short_name=short_name,
        abbreviation=abbreviation,
        code=code + current_num_of_locations,
    )
