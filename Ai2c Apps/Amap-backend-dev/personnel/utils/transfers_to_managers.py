from collections import defaultdict
from typing import List

from personnel.models import Soldier, SoldierTransferRequest
from personnel.utils.get_unique_unit_managers import get_unique_unit_managers


def map_units_to_manager_details(transfer_requests: List[SoldierTransferRequest]):
    """Retrieves details for a list of managers based on an manager ID

    Inputs:
        manager_ids (list): a list of unique manager user IDs

    Returns:
        unit_managers_mappings: (defaultdict) mapping where keys are UICs of gaining units and values
        are lists of dictionaries with manager details"""

    unit_managers_mapping = defaultdict(list)
    for request in transfer_requests:
        unit = request.soldier.unit
        if unit.uic not in unit_managers_mapping:
            manager_ids = get_unique_unit_managers(unit)
            unit_managers_mapping[unit.uic] = get_manager_details(manager_ids)
    return unit_managers_mapping


def get_manager_details(manager_ids):
    """Retrieves details for a list of manager Ids

    Input:
        manager_ids (list): a list of unique manager ids

    Returns:
        list of ditionaries with details for each manager containing name, unit, dod_email"""
    managers = Soldier.objects.filter(user_id__in=manager_ids)
    return [
        {
            "name": f"{manager.rank} {manager.first_name} {manager.last_name}",
            "unit": manager.unit.short_name if manager.unit else "Unknown Unit",
            "dod_email": manager.dod_email or "No E-mail on File",
        }
        for manager in managers
    ]
