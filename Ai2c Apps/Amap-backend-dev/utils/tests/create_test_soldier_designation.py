from datetime import datetime, timezone

from personnel.models import Designation, Soldier, SoldierDesignation, Unit


def create_test_soldier_designation(
    soldier: Soldier,
    designation: Designation,
    unit: Unit | None = None,
    start_date: datetime | str = datetime.now(tz=timezone.utc),
    end_date: datetime | str | None = None,
    last_modified_by: Soldier | None = None,
    designation_removed: bool = False,
) -> SoldierDesignation:
    soldier_designation = SoldierDesignation.objects.create(
        soldier=soldier,
        designation=designation,
        unit=unit,
        start_date=start_date,
        end_date=end_date,
        last_modified_by=last_modified_by,
        designation_removed=designation_removed,
    )

    return soldier_designation
