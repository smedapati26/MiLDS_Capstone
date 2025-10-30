from datetime import datetime, timedelta

import pytz
from django.http import HttpRequest, HttpResponse
from tqdm import tqdm

from faults.model_utils import (
    CorrectiveActionCodes,
    FailureCodes,
    FaultSource,
    FaultStatusCodes,
    HowRecognizedCodes,
    MaintenanceLevelCodes,
    MalfunctionEffectCodes,
    SystemCodes,
    WhenDiscoveredCodes,
)
from faults.models import Fault, FaultAction, MaintainerFaultAction, RawFault, RawFaultAction
from personnel.models import Soldier
from units.models import Unit


def transform_faults(request: HttpRequest):
    filter_date = request.GET.get("filter_date")
    # If filter_date not passed, default to yesterday:
    filter_date = filter_date if filter_date else (datetime.today() - timedelta(days=2)).strftime("%Y-%m-%d")

    # Fault and Fault Record Counters
    new_faults = 0
    new_fault_actions = 0
    new_fault_soldiers = 0

    # Get raw faults from time window specified, create new faults or update existing
    raw_faults = list(RawFault.objects.filter(fault_sync_timestamp__gte=filter_date).values())

    for raw_fault in tqdm(raw_faults):
        try:
            Fault.objects.get(id=raw_fault["id"])
            # Update fault with most recent information (it has changed since it was initially created)
        except Fault.DoesNotExist:
            create_new_fault(raw_fault)
            new_faults += 1

    print("Created {} new faults".format(str(new_faults)))

    # Get raw fault actions from time window specified, create new fault actions or update existing
    raw_fault_actions = list(
        RawFaultAction.objects.filter(fault_action_sync_timestamp__gte=filter_date).values(
            *[f.name for f in RawFaultAction._meta.get_fields() if f.name != "id"]
        )
    )

    for raw_fault_action in tqdm(raw_fault_actions):
        try:
            soldier = Soldier.objects.get(user_id=raw_fault_action["personnel_dodid"])
            try:
                fault_action = FaultAction.objects.get(id=raw_fault_action["id_13_2"])
                try:
                    MaintainerFaultAction.objects.get(fault_action=fault_action, soldier=soldier)
                except MaintainerFaultAction.DoesNotExist:
                    man_hours = raw_fault_action["man_hours"] if raw_fault_action["man_hours"] else 0.1
                    MaintainerFaultAction.objects.create(
                        fault_action=fault_action, soldier=soldier, man_hours=man_hours
                    )
                    new_fault_soldiers += 1
            except FaultAction.DoesNotExist:
                create_new_fault_action(raw_fault_action, soldier)
                new_fault_actions += 1
                new_fault_soldiers += 1
        except Soldier.DoesNotExist:
            pass

    print(
        "Created {} new fault actions with {} associated soldiers".format(
            str(new_fault_actions), str(new_fault_soldiers)
        )
    )

    return HttpResponse("Successfully Transformed New Faults from Vantage.")


def create_new_fault_action(record: dict, maintainer: Soldier):
    """
    If the fault action does not exist, create it

    @param record: (dict) the fault's information
    """

    id_13_2 = record["id_13_2"]
    discovery_date_time = record["discovery_date_time"].astimezone(pytz.utc)
    closed_date_time = record["closed_date_time"].astimezone(pytz.utc) if record["closed_date_time"] else None
    maintenance_action = record["maintenance_action"]
    corrective_action = record["corrective_action"]
    fault_work_unit_code = record["fault_work_unit_code"]
    sequence_number = record["sequence_number"] if record["sequence_number"] else 1
    man_hours = record["man_hours"] if record["man_hours"] else 0.1

    # Get corresponding FK Objects
    try:
        closed_by = Soldier.objects.get(user_id=record["closed_by_dodid"])
    except Soldier.DoesNotExist:
        closed_by = None

    try:
        technical_inspector = Soldier.objects.get(user_id=record["technical_inspector_dodid"])
    except Soldier.DoesNotExist:
        technical_inspector = None

    try:
        associated_fault_id = Fault.objects.get(id=record["id_13_1"])
    except Fault.DoesNotExist:
        print("Missing 13-1: {} - Fault Action Source: {}".format(record["id_13_1"], record["source"]))
        return "Error - 13-2 record created with no corresponding 13-1 record"

    # Get respective codes from raw values
    status_code = FaultStatusCodes.from_raw_value(record["status_code_value"])
    maintenance_level_code = MaintenanceLevelCodes.from_raw_value(record["maintenance_level_code_value"])
    corrective_action_code = CorrectiveActionCodes.from_raw_value(record["action_code_value"])
    source = FaultSource.from_raw_value(record["source"])

    # Create new fault record
    fault_action = FaultAction.objects.create(
        id=id_13_2,
        associated_fault_id=associated_fault_id,
        discovery_date_time=discovery_date_time,
        closed_date_time=closed_date_time,
        closed_by=closed_by,
        maintenance_action=maintenance_action,
        corrective_action=corrective_action,
        status_code=status_code,
        fault_work_unit_code=fault_work_unit_code,
        technical_inspector=technical_inspector,
        maintenance_level_code=maintenance_level_code,
        corrective_action_code=corrective_action_code,
        sequence_number=sequence_number,
        source=source,
    )

    # Create maintainer fault action
    MaintainerFaultAction.objects.create(fault_action=fault_action, soldier=maintainer, man_hours=man_hours)


def create_new_fault(record: dict):
    """
    Function to create a new fault from a raw fault record

    @param record: (dict) the fault's information
    """
    id_13_1 = record["id"]
    serial_number = record["serial_number"]
    fault_discovered_by = record["fault_discovered_by"]
    discovery_date_time = record["discovery_date_time"].astimezone(pytz.utc)
    corrective_date_time = (
        record["corrective_date_time"].astimezone(pytz.utc) if record["corrective_date_time"] else None
    )
    status = record["status"]
    remarks = record["remarks"]
    maintenance_delay = record["maintenance_delay"]
    fault_work_unit_code = record["fault_work_unit_code"]
    total_man_hours = record["total_man_hours"] if record["total_man_hours"] else 0.0

    # Get corresponding FK Objects
    try:
        unit = Unit.objects.get(uic=record["uic"])
    except Unit.DoesNotExist:
        unit = None

    try:
        discovered_by_soldier = Soldier.objects.get(user_id=record["edipi"])
    except Soldier.DoesNotExist:
        discovered_by_soldier = None

    # Get respective codes from raw values
    status_code = FaultStatusCodes.from_raw_value(record["status_code_value"])
    system_code = SystemCodes.from_raw_value(record["system_code_value"])
    when_discovered_code = WhenDiscoveredCodes.from_raw_value(record["when_discovered_code_value"])
    how_recognized_code = HowRecognizedCodes.from_raw_value(record["how_recognized_code_value"])
    malfunction_effect_code = MalfunctionEffectCodes.from_raw_value(record["malfunction_effect_code_value"])
    failure_code = FailureCodes.from_raw_value(record["failure_code_value"])
    corrective_action_code = CorrectiveActionCodes.from_raw_value(record["corrective_action_code_value"])
    maintenance_level_code = MaintenanceLevelCodes.from_raw_value(record["ti_maintenance_level_code_value"])
    source = FaultSource.from_raw_value(record["source"])

    # Create new fault record
    Fault.objects.create(
        id=id_13_1,
        aircraft=serial_number,
        unit=unit,
        discovered_by_name=fault_discovered_by,
        discovered_by_dodid=discovered_by_soldier,
        status_code=status_code,
        system_code=system_code,
        when_discovered_code=when_discovered_code,
        how_recognized_code=how_recognized_code,
        malfunction_effect_code=malfunction_effect_code,
        failure_code=failure_code,
        corrective_action_code=corrective_action_code,
        maintenance_level_code=maintenance_level_code,
        discovery_date_time=discovery_date_time,
        corrective_date_time=corrective_date_time,
        status=status if status in ["0", "1"] else "0",
        remarks=remarks,
        maintenance_delay=maintenance_delay,
        fault_work_unit_code=fault_work_unit_code,
        total_man_hours=total_man_hours,
        source=source,
    )
