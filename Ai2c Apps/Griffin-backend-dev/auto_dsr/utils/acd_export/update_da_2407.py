import pandas as pd
from django.shortcuts import get_object_or_404
from django.utils import timezone
from simple_history.utils import update_change_reason

from aircraft.models import DA_2407, Aircraft
from auto_dsr.models import Unit


def update_da_2407s(records: pd.DataFrame):
    """
    Update/create DA2407s based on an export file from ACD

    @param records: (pd.DataFrame) the data to update the 2407s with
    """
    # Step 1: Archive old work orders from the units that appear in the file
    # because we have no way of knowing when they get closed out otherwise
    # (unless they appear in this file as well, then just update them)
    existing_uics = records["UIC Customer"].unique()
    existing_units = []
    for uic in existing_uics:
        try:
            unit = Unit.objects.get(uic=uic)
            existing_units.append(unit)
        except Unit.DoesNotExist:
            pass
    existing_uic_wons = records.index.tolist()
    existing_da_2407s = DA_2407.objects.filter(customer_unit__in=existing_units).exclude(
        uic_work_order_number__in=existing_uic_wons
    )
    for da_2407 in existing_da_2407s:
        da_2407.is_archived = True
        da_2407.save()
        update_change_reason(da_2407, "Archived by new unit upload")
    # Step 1: Transform the input dataframe such that each row is a work order
    for uic_won, work_order_info in records.iterrows():
        try:
            customer_unit = Unit.objects.get(uic=work_order_info["UIC Customer"])
        except Unit.DoesNotExist:
            print("Unit not found: {}".format(work_order_info["UIC Customer"]))
            continue

        try:
            support_unit = Unit.objects.get(uic=work_order_info["UIC Support"])
        except Unit.DoesNotExist:
            print("Unit not found: {}".format(work_order_info["UIC Support"]))
            continue

        try:  # to get the Aircraft to update
            aircraft = Aircraft.objects.get(serial=work_order_info["End Item"])
        except Aircraft.DoesNotExist:
            aircraft = None

        try:
            da_2407_record = DA_2407.objects.get(
                uic_work_order_number=uic_won,
                customer_unit=customer_unit,
            )
            da_2407_record.work_order_number = work_order_info["WON"]
            da_2407_record.support_unit = support_unit
            if aircraft:
                da_2407_record.aircraft = aircraft
            da_2407_record.shop = work_order_info["Shop"]
            da_2407_record.deficiency = work_order_info["Deficiency"]
            da_2407_record.malfunction_desc = work_order_info["Malfunction Description"]
            da_2407_record.remarks = work_order_info["Remarks"]
            da_2407_record.submitted_datetime = timezone.make_aware(work_order_info["Date Time Submitted"])
            da_2407_record.accepted_datetime = timezone.make_aware(work_order_info["Date Time Accepted"])
            try:
                work_start_datetime = timezone.make_aware(work_order_info["Date Time Work Started"])
                da_2407_record.work_start_datetime = work_start_datetime
            except:
                pass
            da_2407_record.when_discovered = work_order_info["When Disc Meaning"]
            da_2407_record.how_discovered = work_order_info["How Rec Meaning"]
            da_2407_record.workflow_state = work_order_info["Workflow State"]
            da_2407_record.is_archived = False

        except DA_2407.DoesNotExist:
            da_2407_record = DA_2407(
                uic_work_order_number=uic_won,
                customer_unit=customer_unit,
                work_order_number=work_order_info["WON"],
                support_unit=support_unit,
                shop=work_order_info["Shop"],
                deficiency=work_order_info["Deficiency"],
                malfunction_desc=work_order_info["Malfunction Description"],
                remarks=work_order_info["Remarks"],
                submitted_datetime=timezone.make_aware(work_order_info["Date Time Submitted"]),
                accepted_datetime=timezone.make_aware(work_order_info["Date Time Accepted"]),
                when_discovered=work_order_info["When Disc Meaning"],
                how_discovered=work_order_info["How Rec Meaning"],
                workflow_state=work_order_info["Workflow State"],
                is_archived=False,
            )
            try:
                work_start_datetime = timezone.make_aware(work_order_info["Date Time Work Started"])
                da_2407_record.work_start_datetime = work_start_datetime
            except:
                pass
            if aircraft:
                da_2407_record.aircraft = aircraft

        try:
            da_2407_record.save()
            update_change_reason(da_2407_record, "Export File Creation/Update")
        except Exception as e:
            print("Update failed for Work Order {}".format(uic_won))
            continue
