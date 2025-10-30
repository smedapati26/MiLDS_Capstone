import time

import pytz
from django.db import IntegrityError, connection, connections
from django.db.models import CharField, F
from django.db.models.functions import Concat
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
from faults.models import Fault, FaultAction, MaintainerFaultAction
from personnel.models import Soldier
from units.models import Unit


def create_new_fault(record: dict):
    """
    If the fault does not exist, create it

    @param record: (dict) the fault's information
    """
    id = record["id"]
    serial_number = record["serial_number"]
    fault_discovered_by = record["fault_discovered_by"]
    discovery_date_time = pytz.utc.localize(record["discovery_date_time"])
    corrective_date_time = pytz.utc.localize(record["corrective_date_time"]) if record["corrective_date_time"] else None
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
    maintenance_level_code = MaintenanceLevelCodes.from_raw_value(record["TI_maintenance_level_code_value"])
    source = FaultSource.from_raw_value(record["source"])

    # Create new fault record
    Fault.objects.create(
        id=id,
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


def update_fault(record: dict):
    """
    If the fault should be updated (information has changed)
    """


def create_new_fault_action(record: dict):
    """
    If the fault action does not exist, create it

    @param record: (dict) the fault's information
    """

    id = record["id_13_2"]
    discovery_date_time = pytz.utc.localize(record["discovery_date_time"])
    closed_date_time = pytz.utc.localize(record["closed_date_time"]) if record["closed_date_time"] else None
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
        maintainer = Soldier.objects.get(user_id=record["personnel_dodid"])
    except Soldier.DoesNotExist:
        return "Soldier record not found in A-MAP for 13-2 object"

    try:
        associated_fault_id = Fault.objects.get(id=record["id_13_1"])
    except Fault.DoesNotExist:
        return "Error - 13-2 record created with no corresponding 13-1 record"

    # Get respective codes from raw values
    status_code = FaultStatusCodes.from_raw_value(record["status_code_value"])
    maintenance_level_code = MaintenanceLevelCodes.from_raw_value(record["maintenance_level_code_value"])
    corrective_action_code = CorrectiveActionCodes.from_raw_value(record["action_code_value"])
    source = FaultSource.from_raw_value(record["source"])

    # Create new fault record
    fault_action = FaultAction.objects.create(
        id=id,
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

    # return fault_action


def update_fault_action_maintainers(record: dict):
    """
    If the fault action does exist, update MaintainerFaultAction objects

    @param record: (dict) the fault's information
    """
    try:
        fault_action = FaultAction.objects.get(id=record["id_13_2"])
    except FaultAction.DoesNotExist:
        return "Fault Action does not exist"

    try:
        maintainer = Soldier.objects.get(user_id=record["personnel_dodid"])
    except Soldier.DoesNotExist:
        return "Soldier record not found in A-MAP for 13-2 object"

    man_hours = record["man_hours"] if record["man_hours"] else 0.1

    try:
        MaintainerFaultAction.objects.create(fault_action=fault_action, soldier=maintainer, man_hours=man_hours)
    except IntegrityError:
        pass


# Define references

print("Getting current Faults")
current_faults = set(Fault.objects.all().values_list("id", flat=True))
print("Total Faults:", len(current_faults))

print("Getting current Fault actions")
current_fault_actions = set(FaultAction.objects.all().values_list("id", flat=True))
print("Total Fault Actions:", len(current_fault_actions))

print("Getting current fault maintainer actions")
current_maintainer_fault_actions = set(
    MaintainerFaultAction.objects.all()
    .values_list(F("fault_action_id"), F("soldier_id"))
    .annotate(key=Concat(F("fault_action_id"), F("soldier_id"), output_field=CharField()))
    .values_list("key", flat=True)
)
print("Total Maintainer Fault Actions", len(current_maintainer_fault_actions))

print("Getting A-MAP Soldiers")
amap_soldiers = set(Soldier.objects.all().values_list("user_id", flat=True))

# Set to track faults that correspond to fault actions by A-MAP soldiers
fault_guids = set()


def get_corresponding_faults(fault_actions_chunk):
    # First, get fault actions that correspond to current maintainers in A-MAP
    related_fault_actions = 0
    for record in tqdm(fault_actions_chunk):
        # If we don't already have 13-2 record saved, and maintainers are in A-MAP
        if record["id_13_2"] not in current_fault_actions and record["personnel_dodid"] in amap_soldiers:
            related_fault_actions += 1
            fault_guids.add(record["id_13_1"])

    print("Found", related_fault_actions, " fault actions related to A-MAP Soldiers")
    print("There are", len(fault_guids), "global corresponding faults")


def create_faults(fault_chunk):
    # Create all 13-1 records that have corresponding 13-2s with A-MAP soldiers, or were discovered by an A-MAP soldier
    new_faults = 0
    for record in tqdm(fault_chunk):
        if record["id"] in fault_guids or record["edipi"] in amap_soldiers:
            if record["id"] not in current_faults:
                create_new_fault(record)
                new_faults += 1

    print("Created", new_faults, "new faults")


def create_fault_actions(fault_actions_chunk):
    # Create all 13-2 fault actions
    new_fault_actions = 0
    new_fault_action_maintainers = 0

    for record in tqdm(fault_actions_chunk):
        if record["personnel_dodid"] not in amap_soldiers:
            continue
        # Create 13-2 if record does not already exist
        if record["id_13_2"] not in current_fault_actions:
            create_new_fault_action(record)
            # fault_actions_to_create.append(create_new_fault_action(record))
            current_fault_actions.add(record["id_13_2"])
            current_maintainer_fault_actions.add((record["id_13_2"] + record["personnel_dodid"]))
            new_fault_actions += 1
            new_fault_action_maintainers += 1
        elif (record["id_13_2"] + record["personnel_dodid"]) not in current_maintainer_fault_actions:
            update_fault_action_maintainers(record)
            # fault_actions_maintainers_to_create.append(update_fault_action_maintainers(record))
            current_maintainer_fault_actions.add((record["id_13_2"] + record["personnel_dodid"]))
            new_fault_action_maintainers += 1


# First, get all of the corresponding faults for records that we have 13-2 records for
chunk_size = 2000000
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_amap_fault_actions where fault_action_sync_timestamp >= '2025-02-05';")
    columns = [col[0] for col in cursor.description]

    iteration = 1

    # Fetch and process data in chunks
    while True:
        chunk = cursor.fetchmany(chunk_size)
        if not chunk:
            break
        # Process the chunk
        chunk_records = [dict(zip(columns, row)) for row in chunk]

        get_corresponding_faults(chunk_records)

        print("Initial Fault Action iteration", iteration, "complete")
        iteration += 1

chunk_size = 500000
# # Then, create all corresponding 13-1 Fault Records
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_amap_faults where fault_sync_timestamp >= '2025-02-05'")
    columns = [col[0] for col in cursor.description]

    iteration = 1

    # Fetch and process data in chunks
    while True:
        chunk = cursor.fetchmany(chunk_size)
        if not chunk:
            break
        # Process the chunk
        chunk_records = [dict(zip(columns, row)) for row in chunk]

        create_faults(chunk_records)

        print("Fault iteration", iteration, "complete")
        iteration += 1

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_amap_fault_actions where fault_action_sync_timestamp >= '2025-02-05';")
    columns = [col[0] for col in cursor.description]

    # cursor.fetchmany(chunk_size)

    iteration = 1

    # Fetch and process data in chunks
    while True:
        chunk = cursor.fetchmany(chunk_size)
        if not chunk:
            break

        chunk_records = [dict(zip(columns, row)) for row in chunk]
        create_fault_actions(chunk_records)

        print("Fault Action iteration", iteration, "complete")
        iteration += 1
