from aircraft.models import Aircraft, AircraftMod, ModType


def create_single_test_aircraft_modification(aircraft: Aircraft, name: str = "TEST1") -> AircraftMod:
    """
    Creates a single Aircraft Modification object
    @param mod_type: the single modification type
    @param aircraft: the aircraft to create for

    @returns (AircraftMod)
        the newly aircraft mod
    """
    mod_type = ModType.objects.create(name=name)

    aircraft_mod = AircraftMod.objects.create(mod_type=mod_type, aircraft=aircraft, value="test 1")

    return aircraft_mod
