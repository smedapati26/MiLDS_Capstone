def create_raw_fault_action_table():
    """
    SQL Command to create raw fault actions table to test transformations
    """
    return """
                CREATE TABLE IF NOT EXISTS raw_amap_fault_actions (
                    id_13_1 VARCHAR(255),
                    id_13_2 VARCHAR(255),
                    discovery_date_time DATETIME,
                    closed_date_time DATETIME,
                    closed_by_dodid VARCHAR(255),
                    maintenance_action NVARCHAR(2048),
                    corrective_action NVARCHAR(2048),
                    status_code_value VARCHAR(255),
                    fault_work_unit_code VARCHAR(255),
                    technical_inspector_dodid VARCHAR(255),
                    maintenance_level_code_value VARCHAR(255),
                    action_code_value VARCHAR(255),
                    sequence_number FLOAT,
                    personnel_dodid VARCHAR(255),
                    man_hours FLOAT,
                    source VARCHAR(255),
                    fault_action_sync_timestamp DATETIME
                );
            """
