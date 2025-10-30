from datetime import date, datetime

import pandas as pd
import pytz
from django.utils import timezone

from personnel.models import Login, Soldier


def generate_login_data(generate_csv=False, since_date=None):
    # Get all logins
    logins = Login.objects.all()
    if since_date:
        print("here")
        tz_aware_date = datetime.combine(since_date, datetime.min.time(), tzinfo=pytz.UTC)
        logins = logins.filter(login_time__gt=tz_aware_date)

    logins_df = pd.DataFrame(list(logins.values(*["user_id", "login_time"])))

    # Convert datetime to date
    logins_df["date"] = logins_df["login_time"].dt.date

    # Ignore multiple logins in a day
    logins_df.drop_duplicates(["user_id", "date"], inplace=True)

    logins_df["unit"] = None

    def get_historical_unit(row):
        soldier = Soldier.objects.get(user_id=row["user_id"])
        try:
            historical_unit = soldier.history.as_of(row["login_time"]).unit
        except Soldier.DoesNotExist:
            historical_unit = soldier.history.earliest().unit.display_name
        row["unit"] = historical_unit

    # Get soldier unit at the time of the login event
    logins_df.apply(get_historical_unit, axis=1)

    if generate_csv:
        logins_df.to_csv("logins.csv", index=False)


# generate_login_data(True)
generate_login_data(True, date(2024, 9, 22))
