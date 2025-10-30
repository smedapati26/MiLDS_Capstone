from datetime import datetime

from faults.models import RawFault


def create_test_raw_fault(
    id: str = "TEST_13_1_ID_0000",
    serial_number: str = "123456",
    uic: str = "TEST000AA",
    fault_discovered_by: str = "SFC Test User",
    edipi: str = "1234567890",
    status_code_value: str = "X",
    system_code_value: str = "A",
    when_discovered_code_value: str = "G",
    how_recognized_code_value: str = "B",
    malfunction_effect_code_value: str = "3",
    failure_code_value: str = "008",
    corrective_action_code_value: str = "C",
    ti_maintenance_level_code_value: str = "F",
    discovery_date_time: datetime = datetime.now(),
    corrective_date_time: datetime = datetime.now(),
    status: str = "0",
    remarks: str = "Noises coming from #2 ENG, identified FOD in ENG Intake",
    maintenance_delay: str = "None",
    fault_work_unit_code: str = "00",
    total_man_hours: str = "1.5",
    source: str = "GCSS-A",
    fault_sync_timestamp: datetime = datetime.now(),
) -> str:
    """
    Returns raw sql command with parameters to create a raw fault object in the raw_fault
    table.
    """
    sql = """
        INSERT INTO raw_amap_faults (
            id,
            serial_number,
            uic,
            fault_discovered_by,
            edipi,
            status_code_value,
            system_code_value,
            when_discovered_code_value,
            how_recognized_code_value,
            malfunction_effect_code_value,
            failure_code_value,
            corrective_action_code_value,
            ti_maintenance_level_code_value,
            discovery_date_time,
            corrective_date_time,
            status,
            remarks,
            maintenance_delay,
            fault_work_unit_code,
            total_man_hours,
            source,
            fault_sync_timestamp
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
            %s,
            %s,
            %s,
            %s,
            %s,
            %s
        )
    """
    params = [
        id,
        serial_number,
        uic,
        fault_discovered_by,
        edipi,
        status_code_value,
        system_code_value,
        when_discovered_code_value,
        how_recognized_code_value,
        malfunction_effect_code_value,
        failure_code_value,
        corrective_action_code_value,
        ti_maintenance_level_code_value,
        discovery_date_time,
        corrective_date_time,
        status,
        remarks,
        maintenance_delay,
        fault_work_unit_code,
        total_man_hours,
        source,
        fault_sync_timestamp,
    ]
    return sql, params
