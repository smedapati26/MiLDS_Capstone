from datetime import datetime

from faults.models import RawFaultAction


def create_test_raw_fault_action(
    id_13_1: str = "TEST_13_1_ID_0000",
    id_13_2: str = "TEST_13_2_ID_0000",
    discovery_date_time: datetime = datetime.now(),
    closed_date_time: datetime = datetime.now(),
    closed_by_dodid: str = "1234567890",
    maintenance_action: str = "Removed #2 ENG Fairing",
    corrective_action: str = "Inspected filter",
    status_code_value: str = "X",
    fault_work_unit_code: str = "00",
    technical_inspector_dodid: str = "1234567890",
    maintenance_level_code_value: str = "F",
    action_code_value: str = "R",
    sequence_number: str = "1",
    personnel_dodid: str = "1234567890",
    man_hours: str = "0.1",
    source: str = "GCSS-A",
    fault_action_sync_timestamp: datetime = datetime.now(),
) -> str:
    """
    Returns raw sql command with parameters to create a raw fault action object in the raw_fault_action
    table.
    """
    sql = """
        INSERT INTO raw_amap_fault_actions (
            id_13_1,
            id_13_2,
            discovery_date_time,
            closed_date_time,
            closed_by_dodid,
            maintenance_action,
            corrective_action,
            status_code_value,
            fault_work_unit_code,
            technical_inspector_dodid,
            maintenance_level_code_value,
            action_code_value,
            sequence_number,
            personnel_dodid,
            man_hours,
            source,
            fault_action_sync_timestamp
        ) VALUES (
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s
        )
    """
    params = [
        id_13_1,
        id_13_2,
        discovery_date_time,
        closed_date_time,
        closed_by_dodid,
        maintenance_action,
        corrective_action,
        status_code_value,
        fault_work_unit_code,
        technical_inspector_dodid,
        maintenance_level_code_value,
        action_code_value,
        sequence_number,
        personnel_dodid,
        man_hours,
        source,
        fault_action_sync_timestamp,
    ]
    return sql, params
