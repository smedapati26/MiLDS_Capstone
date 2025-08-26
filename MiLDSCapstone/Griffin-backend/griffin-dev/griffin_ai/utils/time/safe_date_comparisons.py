from datetime import datetime
from django.utils import timezone


def is_up_to_date(new_time: datetime, existing_time: datetime) -> bool:
    """
    Compares two timestamps and indicates if the data represented by the
    new timestamps is as up to date as the existing timestamp

    @param new_time: (datetime.datetime) the timestamp for the new record
    @param existing_time: (datetime.datetime) the timestamp for the existing record
    @returns (bool) A boolean indicating if the record is already up to date
                    or if it should be updated with newer information
    """
    if timezone.is_aware(new_time):
        safe_new_time = timezone.make_naive(new_time)
    else:
        safe_new_time = new_time
    if timezone.is_aware(existing_time):
        safe_existing_time = timezone.make_naive(existing_time)
    else:
        safe_existing_time = existing_time

    return safe_new_time <= safe_existing_time
