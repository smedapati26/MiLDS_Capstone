def create_raw_fault_table():
    """
    SQL Command to create raw faults table to test transformations
    """
    return """
                CREATE TABLE IF NOT EXISTS raw_amap_faults (
                    id VARCHAR(255),
                    serial_number VARCHAR(255),
                    uic VARCHAR(255),
                    fault_discovered_by VARCHAR(255),
                    edipi VARCHAR(255),
                    status_code_value VARCHAR(255),
                    system_code_value VARCHAR(255),
                    when_discovered_code_value VARCHAR(255),
                    how_recognized_code_value VARCHAR(255),
                    malfunction_effect_code_value VARCHAR(255),
                    failure_code_value VARCHAR(255),
                    corrective_action_code_value VARCHAR(255),
                    TI_maintenance_level_code_value VARCHAR(255),
                    discovery_date_time DATETIME,
                    corrective_date_time DATETIME,
                    status FLOAT,
                    remarks VARCHAR(4086),
                    maintenance_delay VARCHAR(255),
                    fault_work_unit_code VARCHAR(255),
                    total_man_hours VARCHAR(255),
                    source VARCHAR(255),
                    fault_sync_timestamp DATETIME
                );
            """
