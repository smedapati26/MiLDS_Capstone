from aircraft.models import Aircraft
from auto_dsr.models import Location


def update_aircraft_location(aircraft: Aircraft, new_location: str) -> str:
    """
    Updates the current location for a given aircraft based on newly ingested data

    @param aircraft: (Aircraft) the aircraft to update
    @param new_location: (str) the location field provided in the new record

    @returns (str) the location field to enter in the aircraft record after updating
    """

    # no location data is available for this aircraft
    if not new_location:
        return aircraft.location

    # Check if the value matches a location code
    code_qs = Location.objects.filter(code=new_location)
    if code_qs.count() == 1:
        return code_qs.first()

    # Check if the name matches a location name
    name_qs = Location.objects.filter(name=new_location)
    if name_qs.count() == 1:
        return name_qs.first()

    return aircraft.location
