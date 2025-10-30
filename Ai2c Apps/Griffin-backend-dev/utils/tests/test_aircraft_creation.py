from datetime import datetime

from django.utils import timezone

from aircraft.model_utils import AircraftStatuses
from aircraft.models import Aircraft, Airframe
from auto_dsr.models import Location, Unit


def create_test_aircraft_in_all(
    units: list[Unit], num_of_aircraft: int = 1, echelon_dependant: bool = False
) -> list[Aircraft]:
    """
    Creates a set number of Aircraft objects in each of the Units from the passed in list,
    along with their UnitAircraft objects including respective parent units.

    @param units: (list[Unit]) A list of Unit objects
    @param num_of_aircraft: (int) The number of Aircraft objects to create in each Unit
    @param echelon_dependant: (bool) A flag to set when only desiring Company Units to create Aircraft and Unit Aircraft objects.

    @returns (list[Aircraft])
            The list of newly created Aircraft objects.
    """
    aircraft_created = []
    for unit in units:
        total_aircraft = Aircraft.objects.count()

        if echelon_dependant and unit.echelon == "CO":
            for i in range(num_of_aircraft):
                aircraft_serial = unit.uic + "AIRCRAFT" + str(i + total_aircraft)

                new_aircraft = create_single_test_aircraft(current_unit=unit, serial=aircraft_serial)

                aircraft_created.append(new_aircraft)
        else:
            for i in range(num_of_aircraft):
                aircraft_serial = unit.uic + "AIRCRAFT" + str(i + total_aircraft)

                new_aircraft = create_single_test_aircraft(current_unit=unit, serial=aircraft_serial)

                aircraft_created.append(new_aircraft)

    return aircraft_created


def create_single_test_aircraft(
    current_unit: Unit,
    serial: str = "TESTAIRCRAFT",
    model: str = "TH-10A",
    status: AircraftStatuses = AircraftStatuses.FMC,
    rtl: str = "RTL",
    total_airframe_hours: float = 100.0,
    hours_to_phase: float = 50,
    location: Location = None,
    should_sync: bool = True,
    airframe: Airframe = None,
    equipment_number: str = "AIRCRAFT1",
    mds: str = "TH-10AS",
    last_sync_time: datetime = timezone.now(),
    last_export_upload_time: datetime = timezone.now(),
    last_update_time: datetime = timezone.now(),
) -> Aircraft:
    """
    Creates a single Aircraft object.

    @param current_unit: (Unit) The Unit object the new Aircraft is to be assigned to
    @param serial: (str) The primary key value for the new Aircraft
    @param model: (str) The aircraft mission design series value for the new Aircraft
    @param status: (AircraftStatuses) The maintenance status value for the new Aircraft
    @param rtl: (str) The ready to launch status value for the new Aircraft
    @param total_airframe_hours: (float) The lifetime flight hours value for the new Aircraft
    @param hours_to_phase: (float) The flight hours until phase inspection value for the new Aircraft
    @param location: (Location) defaults to none, the aircraft's current location
    @param should_sync: (bool) a boolean flag indicating if the aircraft should sync

    @returns (Aircraft)
            The newly created Aircraft object.
    """
    if not airframe:
        airframe, _ = Airframe.objects.get_or_create(mds=mds, model=model, family="TSTFamily")
    aircraft = Aircraft.objects.create(
        serial=serial,
        model=model,
        status=status,
        rtl=rtl,
        total_airframe_hours=total_airframe_hours,
        hours_to_phase=hours_to_phase,
        current_unit=current_unit,
        location=location,
        should_sync=should_sync,
        airframe=airframe,
        last_sync_time=last_sync_time,
        last_export_upload_time=last_export_upload_time,
        last_update_time=last_update_time,
        equipment_number=equipment_number,
        owning_unit=current_unit,
    )

    aircraft.uic.add(current_unit, *current_unit.parent_uics)

    return aircraft
