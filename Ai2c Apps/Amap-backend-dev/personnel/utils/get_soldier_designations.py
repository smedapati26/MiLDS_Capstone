from personnel.models import Soldier, SoldierDesignation


def get_soldier_designations(soldier: Soldier):
    soldier_designations = SoldierDesignation.objects.filter(soldier=soldier, designation_removed=False)
    active_designations = set(
        [
            soldier_designation.designation.type
            for soldier_designation in soldier_designations
            if soldier_designation.is_active()
        ]
    )
    return ", ".join(active_designations)
