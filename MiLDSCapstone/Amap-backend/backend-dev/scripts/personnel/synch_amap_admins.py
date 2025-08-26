"""
A Script to load AMAP admins from dev into another database.
Requires adjusted database configurations to manage multiple databases.
ie.
    "dev": {
        "ENGINE": "mssql",
        "NAME": os.environ["DEV_DB_NAME"],
        "USER": os.environ["DEV_DB_USER"],
        "PASSWORD": os.environ["DEV_DB_PASS"],
        "HOST": os.environ["DB_HOST"],
        "OPTIONS": {"driver": os.environ["DB_DRIVER"]},
    },
"""
from personnel.models import Soldier

admins = Soldier.objects.using("dev").filter(is_admin=True)

for a in admins:
    a.save(using="default")
