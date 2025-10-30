from datetime import date, datetime

from auto_dsr.models import TaskForce, Unit


def create_test_taskforce(
    uic: Unit,
    start_date: str | date | datetime = "2023-01-01",
    end_date: str | date | datetime | None = "2024-01-01",
) -> TaskForce:
    """
    Creates a TaskForce object.

    @param uic: (Unit) The Unit object the new TaskForce is to be assigned to
    @param start_date: (str | date | datetime) The task force mission begin date value for the new TaskForce
    @param end_date: (str | date | datetime | None) The task force mission end date value for the new TaskForce; can be None

    @returns (TaskForce)
            The newly created TaskForce object.
    """
    return TaskForce.objects.create(uic=uic, start_date=start_date, end_date=end_date)
