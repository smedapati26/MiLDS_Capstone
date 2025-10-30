from aircraft.model_utils.modification_types import RAW_DATA_MODIFICATION_DATA_TYPES


def valid_modification_data_type(modification_key: str, modification_value: str | int | bool):
    """
    Checks to see if the data that will set on an Applied Modifiction column is of the right type
    or not.

    @param modification_key: (str) The column on an Applied Modification that is being set/updated.
                                              This works for raw data types, any custom types/objects/models should have
                                              a custom check for those;
                                              see aircraft/views/crud/applied_modification_create.py for examples.
    @param modification_value: (str |int | bool) The data that the column above is being set to.
    @param access_level: (UserRoleAccessLevel) The UserRoleAccessLevel to assess for

    @returns (bool) Truthy value representing if data for this column is of the correct type or not.
    """
    return type(modification_value) == RAW_DATA_MODIFICATION_DATA_TYPES[modification_key]
