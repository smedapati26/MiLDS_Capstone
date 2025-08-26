"""
A Script to load units from griffin.ai into another database.
Requires adjusted database configurations to manage multiple databases
ie.
    "griffin.ai": {
        "ENGINE": "mssql",
        "NAME": os.environ["GRIFFIN_DB_NAME"],
        "USER": os.environ["GRIFFIN_DB_USER"],
        "PASSWORD": os.environ["GRIFFIN_DB_PASS"],
        "HOST": os.environ["DB_HOST"],
        "OPTIONS": {"driver": os.environ["DB_DRIVER"]},
    },
"""

from personnel.models import Unit


def synch_unit(uics: [str]):
    griffin_units = Unit.objects.using("griffin.ai").filter(uic__in=uics)

    for unit in griffin_units:
        unit.save(using="default")
        if len(unit.child_uics) > 0:
            synch_unit(unit.child_uics)


Unit.objects.using("griffin.ai").get(uic="WDARFF").save(using="default")
synch_unit(Unit.objects.using("griffin.ai").get(uic="WDARFF").child_uics)

# Add AI2C
ai2c = Unit.objects.create(
    uic="W0F0AA",
    short_name="AI2C",
    display_name="Artificial Intelligence Integration Center",
    echelon="CNTR",
    parent_uic=Unit.objects.get(uic="W0CUFF"),
)
ai2c.set_all_unit_lists()
for uic in ai2c.parent_uics:
    u = Unit.objects.get(uic=uic)
    u.set_subordinate_uics()
    u.set_child_uics()
# Add Transient Company
Unit.objects.create(uic="TRANSIENT", short_name="Transient", display_name="Soldiers in Transit", echelon="UNK")
