import pandas as pd
from django.db import IntegrityError

from auto_dsr.models import Unit
from uas.models import UAC, UAV, UnitUAC, UnitUAV

unit = Unit.objects.get(short_name="UAS - TF Albatross")


def assign_uav_or_uac(row):
    if row.model.startswith("MQ"):
        try:
            uav = UAV.objects.get(serial_number=row.serial_number)
            return
        except UAV.DoesNotExist:
            print("where is:", row)
        try:
            UnitUAV.objects.create(unit=unit, uav=uav)
        except IntegrityError:
            print("uav:", row.serial_number, "already has record in:", unit.short_name)
        for uic in unit.parent_uics:
            try:
                UnitUAV.objects.create(unit=Unit.objects.get(uic=uic), uav=uav)
            except IntegrityError:
                print("uav:", row.serial_number, "already has record in:", unit.short_name)
        uav.current_unit = unit
        uav.save()
    else:
        try:
            griffin_model_name = row.model + "(MQ-1C)"
            uac = UAC.objects.get(serial_number=row.serial_number, model=griffin_model_name)
        except UAC.DoesNotExist:
            print("where is:", row)
            return
        try:
            UnitUAC.objects.create(unit=unit, uac=uac)
        except IntegrityError:
            print("uac:", row.serial_number, "already has record in:", unit.short_name)
        for uic in unit.parent_uics:
            try:
                UnitUAC.objects.create(unit=Unit.objects.get(uic=uic), uac=uac)
            except IntegrityError:
                print("uac:", row.serial_number, "already has record in:", unit.short_name)
        uac.current_unit = unit
        uac.save()


df = pd.read_csv("scripts/unit_dsr_data/tf_albatross.csv", dtype={"serial_number": "str"})
df.apply(lambda row: assign_uav_or_uac(row), axis=1)
