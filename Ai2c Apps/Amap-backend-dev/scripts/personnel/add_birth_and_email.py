from django.db import connection

from personnel.models import Soldier


# Add dod_email and birth_month to existing soldiers
def add_birth_and_email():
    """
    Read Birth Month and DOD Email into existing soldiers model
    """
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM raw_amap_soldiers;")
        columns = [col[0] for col in cursor.description]
        records = [dict(zip(columns, row)) for row in cursor.fetchall()]
    for record in records:
        birth_month = record["birth_month"]
        dod_email = record["dod_email"]
        soldier_id = record["edipi"]
        try:
            soldier = Soldier.objects.get(user_id=soldier_id)
            birth_month_mapping = {
                1: "JAN",
                2: "FEB",
                3: "MAR",
                4: "APR",
                5: "MAY",
                6: "JUN",
                7: "JUL",
                8: "AUG",
                9: "SEP",
                10: "OCT",
                11: "NOV",
                12: "DEC",
            }
            soldier.birth_month = birth_month_mapping[birth_month]
            soldier.dod_email = dod_email
            soldier.save()

        except Soldier.DoesNotExist:
            pass


add_birth_and_email()
