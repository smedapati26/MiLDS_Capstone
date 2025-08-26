from personnel.models import Unit, Soldier, MOSCode
from django.db import connection
import pandas as pd

# Read data from DB
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM personnel_user_logins;")
    columns = [col[0] for col in cursor.description]
    logins = [dict(zip(columns, row)) for row in cursor.fetchall()]
    login_df = pd.DataFrame(logins)

print(login_df.head())
print("----- Total Unique Users ----")
print(login_df["user_id"].nunique())
