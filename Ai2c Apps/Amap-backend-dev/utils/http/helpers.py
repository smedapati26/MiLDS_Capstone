"""
Helper Functions
"""

import typing


def validate_required_fields(required_fields, dict_to_validate, return_bool=False):
    """Validates required fields are present and values are not None or "" (Empty string)

    @param: required_fields (list): Required fields
    @param: dict_to_validate (dict): Dictionary to check if required fields are valid
    @param: return_bool (bool, optional): Returns boolean instead of list when True. Defaults to False.

    @returns: (list | bool): IF return_bool = True then returns boolean ELSE returns list
    """
    is_valid = True
    errors = []
    missing_fields = []

    for field in required_fields:
        if field not in dict_to_validate.keys():
            errors.append(f"{field} missing.")
            is_valid = False

        elif dict_to_validate[field] == None or dict_to_validate[field] == "":
            missing_fields.append(field)

    if missing_fields:
        for field in missing_fields:
            errors.append(f"{field} missing.")
            is_valid = False

    return is_valid if return_bool else errors


def validate_allowed_fields(allowed_fields, dict_to_validate, return_bool=False):
    """Validates if all dictionary fields are allowed

    @param: allowed_fields (list): List of fields allowed to update
    @param: dict_to_validate (dict): Dictionary to check if all fields are allowable
    @param: return_bool (bool, optional): Returns boolean instead of list when True. Defaults to False.

    @returns: (list | bool): IF return_bool = True then returns boolean ELSE returns list
    """
    is_valid = True
    errors = []

    for field in dict_to_validate.keys():
        if field not in allowed_fields:
            errors.append(f"{field} not allowed.")
            is_valid = False

    return is_valid if return_bool else errors


def update_object_attributes(key_value_dict: dict, update_object: typing.Any):
    """Updates an objects attributes to new values passed in as a dictionary

    @param: key_value_dict (dict): Dictionary used for updating object values
    @param: update_object (typing.Any): Any object instance to update it's values

    @raises: (AttributeError) If attribute from key_value_dict is not found as attribute
    """
    for key, value in key_value_dict.items():
        if not hasattr(update_object, key):
            raise AttributeError

        value = key_value_dict.get(key, None)
        if value is not None:
            setattr(update_object, key, value)
