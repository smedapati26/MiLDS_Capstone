from datetime import datetime

from django.utils.timezone import make_aware
from simple_history.utils import update_change_reason
from tqdm import tqdm

from personnel.models import SoldierFlag


def fix_soldier_flags():
    # Get all flags
    all_flags = SoldierFlag.objects.all()

    # Cutoff date - after November 4th, 2024 (when first bug was fixed)
    cutoff_date = make_aware(datetime(2024, 11, 5))

    # Reset all flags to the last date that last_modified = history_user
    # The following risks are assumed:
    #   - since deleting does not update the last_modified, this will potentially undelete flags that were intentionally deleted by someone other than the flag creator
    #   - since unit flag updates do not update the last_modified_by for the individual flags underneath, but do for the unit flag itself, this will cause those individual flags under
    #       the unit flag to revert to the initial state from when they were created from the parent unit flag. This is something that we will have to reconcile when we refactor the unit flag model
    #       and assign unit flags as parents to those individual unit flags.

    for soldier_flag in tqdm(all_flags):
        # Get historical entries where history_user == last_updated_by
        history = (
            soldier_flag.history.filter(history_user_id=soldier_flag.last_modified_by.user_id)
            .filter(history_date__gte=cutoff_date)
            .order_by("-history_date")
        )

        if history.exists():
            # Most recent valid historical record
            latest_valid_history = history.first()

            # Revert current object to historical values
            for field in soldier_flag._meta.fields:
                if field.name not in ["id", "pk"]:  # avoid overwriting ID
                    setattr(soldier_flag, field.name, getattr(latest_valid_history, field.name))

            # Save the reverted object
            soldier_flag.save()

            # Optional: track the change reason
            update_change_reason(soldier_flag, "Reverted to latest version where history_user == last_updated_by")

    # TODO - take a second pass at individual unit flags, revert (or advance) those to when their flag data (unit flag type, remarks, etc)
    # to when they matched another unit flag with the same UIC (when thier parent unit flag was modified) to capture deletions, modifications


fix_soldier_flags()
