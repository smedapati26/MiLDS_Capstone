"""
A Script to load all tasks models from dev into another database.
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
from tasks.models import MOS, Ictl, MosIctls, Task, IctlTasks

dev_mos = MOS.objects.using("dev").all()
for m in dev_mos:
    m.save(using="default")

dev_ictls = Ictl.objects.using("dev").all()
for i in dev_ictls:
    i.save(using="default")

dev_mos_ictls = MosIctls.objects.using("dev").all()
for mi in dev_mos_ictls:
    mi.save(using="default")

dev_tasks = Task.objects.using("dev").all()
for t in dev_tasks:
    t.save(using="default")

dev_ictl_tasks = IctlTasks.objects.using("dev").all()
for it in dev_ictl_tasks:
    it.save(using="default")
