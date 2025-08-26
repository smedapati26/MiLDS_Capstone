from datetime import date, datetime

from agse.models import AGSE, UnitAGSE, AgseEdits
from agse.model_utils import AgseStatus, AgseEditsLockType
from auto_dsr.models import Unit, User


def create_single_test_agse_edit(
    agse: AGSE,
    entered_by: User,
    lock_type: AgseEditsLockType = AgseEditsLockType.UGSRE,
    date_locked: str | date | datetime | None = None,
) -> AgseEdits:
    """
    Creates a single AGSE Edit object.

    @param agse: (AGSE) The AGSE object that the new AgseEdits will be assigned to
    @param entered_by: (User) The User object creating the new AgseEdits
    @param lock_type: (AgseEditsLockType) The AgseEditsLockType choice for the new AgseEdits
    @param date_locked: (str | date | datetime | None) The date lock entered value for the new AgseEdits; can be None

    @returns (AgseEdits)
            The newly created AgseEdits object.
    """
    return AgseEdits.objects.create(
        equipment_number=agse,
        entered_by=entered_by,
        lock_type=lock_type,
        date_locked=date_locked,
    )


def create_test_agse_in_all(units: list[Unit], num_of_agse: int = 1) -> list[AGSE]:
    """
    Creates a set number of AGSE objects in each of the Units from the passed in list,
    along with their respective parent units and required UnitAGSE objects.

    @param units: (list[Unit]) A list of Unit objects
    @param num_of_agse: (int) The number of AGSE objects to create in each Unit

    @returns (list[AGSE])
            The list of newly created AGSE objects.
    """
    agse_created = []

    for unit in units:
        if unit.echelon == "CO":
            total_agse = AGSE.objects.count()

            for i in range(num_of_agse):
                equipment_number = unit.uic + "AGSE" + str(i + total_agse)

                new_agse = create_single_test_agse(current_unit=unit, equipment_number=equipment_number)

                agse_created.append(new_agse)

                for uic in [unit.uic] + unit.parent_uics:
                    UnitAGSE.objects.create(equipment_number=new_agse, uic=Unit.objects.get(uic=uic))

    return agse_created


def create_single_test_agse(
    current_unit: Unit,
    equipment_number: str = "TESTAGSE",
    serial_number: str = "1234567890",
    lin: str = "TESTLIN",
    model: str | None = None,
    nomenclature: str = "TEST NOMENCLATURE",
    display_name: str = "TEST DISPLAY NAME",
    condition: AgseStatus = AgseStatus.FMC,
    earliest_nmc_start: str | date | datetime | None = None,
    days_nmc: float | None = None,
    remarks: str | None = None,
) -> AGSE:
    """
    Creates a single AGSE object.

    @param current_unit: (Unit) The Unit object that the new AGSE will be assigned to
    @param equpiment_number: (str) The primary key value for the new AGSE
    @param serial_number: (str) The serial number value for the new AGSE
    @param lin: (str) The line test number value for the new AGSE
    @param model: (str | none) The equipment model value for the new AGSE; can be None
    @param nomenclature: (str) The equipment nomenclauture value for the new AGSE
    @param display_name: (str) The equipment display name value for the new AGSE
    @param condition: (AgseStatus) The maintaince status value for the new AGSE
    @param earliest_nmc_start: (str | date | datetime | None) The starting date of NMC status value for the new AGSE; can be None
    @param days_nmc: (float | none) The days NMC value for the new AGSE; can be None
    @param remarks: (str | none) The equipment remarks value for the new AGSE; can be None

    @returns (AGSE)
            The newly created AGSE object.
    """
    return AGSE.objects.create(
        current_unit=current_unit,
        equipment_number=equipment_number,
        lin=lin,
        serial_number=serial_number,
        condition=condition,
        nomenclature=nomenclature,
        display_name=display_name,
        earliest_nmc_start=earliest_nmc_start,
        model=model,
        days_nmc=days_nmc,
        remarks=remarks,
    )
