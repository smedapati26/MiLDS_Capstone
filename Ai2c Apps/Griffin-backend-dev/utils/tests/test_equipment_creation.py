from datetime import datetime

from django.utils import timezone

from aircraft.model_utils import EquipmentStatuses, EquipmentValueCodes
from aircraft.models import Aircraft, Equipment, EquipmentModel, UnitEquipment
from auto_dsr.models import Unit


def create_test_equipment_in_all(
    units: list[Unit], equipment_model: EquipmentModel, aircraft: Aircraft | None = None, num_of_equipment: int = 1
) -> list[Equipment]:
    """
    Creates a set number of Equipment objects in each of the Units from the passed in list,
    along with their UnitEquipment objects including respective parent units.

    @param units: (list[Unit]) A list of Unit objects
    @param units: (Aircraft) The Aircraft object the Equipment is being created for
    @param num_of_equipment: (int) The number of Equipment objects to create in each Unit

    @returns (list[Equipment])
            The list of newly created Equipment objects.
    """
    equipment_created = []
    for unit in units:
        total_equipment = Equipment.objects.count()

        for i in range(num_of_equipment):
            equipment_serial = unit.uic + "EQUIP" + str(i + total_equipment)

            new_equipment = create_single_test_equipment(
                serial_number=equipment_serial, unit=unit, model=equipment_model, installed_on_aircraft=aircraft
            )

            for uic in [unit.uic] + unit.parent_uics:
                UnitEquipment.objects.create(equipment=new_equipment, unit=Unit.objects.get(uic=uic))

            equipment_created.append(new_equipment)

    return equipment_created


def create_single_test_equipment(
    serial_number: str,
    current_unit: Unit,
    model: EquipmentModel,
    installed_on_aircraft: Aircraft | None = None,
    status: EquipmentStatuses = EquipmentStatuses.UNK,
    value: float = 0.0,
    value_code: EquipmentValueCodes = EquipmentValueCodes.UNKNOWN,
    remarks: str = "NA",
    date_down: str | datetime | None = None,
    ecd: str | datetime | None = None,
) -> Equipment:
    """
    Creates a single Equipment object.

    @param serial_number: (str) The primary key value for the new Equipment,
    @param model: (str) The equipment model string value for this Equipment,
    @param current_unit: (Unit) The Unit object that this Equipment is currently assigned to,
    @param installed_on_aircraft: (Aircraft | None) The Aircraft object the new Equipment is assigned to,
    @param status: (EquipmentStatuses) The equipment status value for the new Equipment,
    @param value: (float) The value associated with the Equipment's Value Code,
    @param value_code: (EquipmentValueCodes) The EquipmentValueCode value associated with the new Equipment value,
    @param remarks: (float) String containing any User Remarks for the new Equipment,
    @param date_down: (float) Date the Equipment goes into NMC,
    @param ecd: (float) Date the Equipment goes into FMC

    @returns (Equipment)
            The newly created Equipment object.
    """
    new_equipment = Equipment.objects.create(
        serial_number=serial_number,
        model=model,
        installed_on_aircraft=installed_on_aircraft,
        current_unit=current_unit,
        status=status,
        value=value,
        value_code=value_code,
        remarks=remarks,
        date_down=date_down,
        ecd=ecd,
        last_sync_time=timezone.now(),
        last_export_upload_time=timezone.now(),
        last_update_time=timezone.now(),
    )

    for uic in [current_unit.uic] + current_unit.parent_uics:
        UnitEquipment.objects.create(equipment=new_equipment, unit=Unit.objects.get(uic=uic))

    return new_equipment
