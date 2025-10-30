from django.db.models import Max, Q
from django.http import HttpRequest, HttpResponse
from django.utils import timezone

from aircraft.models import Aircraft, Fault, RawFault
from aircraft.utils import get_status_code
from auto_dsr.models import RawSyncTimestamp, Unit
from utils.data import JULY_FOURTH_1776


def transform_faults(all_faults: bool = False):
    """
    Transforms Vantage faults dataset records into fault records

    @params request: (django.http.HttpRequest) the request object
    """
    start_sync = timezone.now()

    if not all_faults:
        last_sync = RawSyncTimestamp.objects.filter(table="aircraft_rawfault").aggregate(Max("most_recent_sync"))[
            "most_recent_sync__max"
        ]
    else:
        last_sync = JULY_FOURTH_1776

    # Make sure only faults with Aircraft and Units in Griffin are added.
    filters = {
        "uic__in": [uic for uic in Unit.objects.values_list("uic", flat=True)],
        "serial_number__in": [aircraft for aircraft in Aircraft.objects.values_list("serial", flat=True)],
    }
    current_faults = [vantage_id for vantage_id in Fault.objects.values_list("vantage_id", flat=True)]

    # Get RAW Faults to update
    update_faults = RawFault.objects.filter(
        Q(corrective_date_time__isnull=True, discovery_date_time__gte=last_sync)
        | Q(corrective_date_time__isnull=False, corrective_date_time__gte=last_sync),
        **filters,
        id__in=current_faults,
    )

    # Get New RAW Faults
    new_faults = RawFault.objects.filter(
        Q(corrective_date_time__isnull=True, discovery_date_time__gte=last_sync)
        | Q(corrective_date_time__isnull=False, corrective_date_time__gte=last_sync),
        **filters,
    ).exclude(id__in=current_faults)

    update_count = 0
    # Updates
    for row in update_faults:
        try:
            tmp_air = Aircraft.objects.get(serial=row.serial_number)
            tmp_unit = Unit.objects.get(uic=row.uic)
        except (Aircraft.DoesNotExist, Unit.DoesNotExist):
            continue

        status_code_value = get_status_code(row.status_code_value)

        fault = Fault.objects.get(vantage_id=row.id)
        fault.aircraft = tmp_air
        fault.unit = tmp_unit
        fault.fault_discovered_by = row.fault_discovered_by
        fault.edipi = row.edipi
        fault.dod_email = row.dod_email
        fault.status_code_value = status_code_value
        fault.status_code_meaning = row.status_code_meaning
        fault.system_code_value = row.system_code_value
        fault.system_code_meaning = row.system_code_meaning
        fault.when_discovered_code_value = row.when_discovered_code_value
        fault.when_discovered_code_meaning = row.when_discovered_code_meaning
        fault.how_recognized_code_value = row.how_recognized_code_value
        fault.how_recognized_code_meaning = row.how_recognized_code_meaning
        fault.malfunction_effect_code_value = row.malfunction_effect_code_value
        fault.malfunction_effect_code_meaning = row.malfunction_effect_code_meaning
        fault.failure_code_value = row.failure_code_value
        fault.failure_code_meaning = row.failure_code_meaning
        fault.corrective_action_code_value = row.corrective_action_code_value
        fault.corrective_action_code_meaning = row.corrective_action_code_meaning
        fault.ti_maintenance_level_code_value = row.ti_maintenance_level_code_value
        fault.ti_maintenance_level_code_meaning = row.ti_maintenance_level_code_meaning
        fault.reason = row.reason
        fault.discovery_date_time = row.discovery_date_time
        fault.corrective_date_time = row.corrective_date_time
        fault.status = row.status
        fault.remarks = row.remarks
        fault.maintenance_delay = row.maintenance_delay
        fault.fault_work_unit_code = row.fault_work_unit_code
        fault.source = row.source

        fault.save()
        update_count = update_count + 1

    objects_to_create = []

    for row in new_faults:
        try:
            tmp_air = Aircraft.objects.get(serial=row.serial_number)
            tmp_unit = Unit.objects.get(uic=row.uic)
        except (Aircraft.DoesNotExist, Unit.DoesNotExist):
            continue

        status_code_value = get_status_code(row.status_code_value)

        objects_to_create.append(
            Fault(
                aircraft=tmp_air,
                unit=tmp_unit,
                vantage_id=row.id,
                fault_discovered_by=row.fault_discovered_by,
                edipi=row.edipi,
                dod_email=row.dod_email,
                status_code_value=status_code_value,
                status_code_meaning=row.status_code_meaning,
                system_code_value=row.system_code_value,
                system_code_meaning=row.system_code_meaning,
                when_discovered_code_value=row.when_discovered_code_value,
                when_discovered_code_meaning=row.when_discovered_code_meaning,
                how_recognized_code_value=row.how_recognized_code_value,
                how_recognized_code_meaning=row.how_recognized_code_meaning,
                malfunction_effect_code_value=row.malfunction_effect_code_value,
                malfunction_effect_code_meaning=row.malfunction_effect_code_meaning,
                failure_code_value=row.failure_code_value,
                failure_code_meaning=row.failure_code_meaning,
                corrective_action_code_value=row.corrective_action_code_value,
                corrective_action_code_meaning=row.corrective_action_code_meaning,
                ti_maintenance_level_code_value=row.ti_maintenance_level_code_value,
                ti_maintenance_level_code_meaning=row.ti_maintenance_level_code_meaning,
                reason=row.reason,
                discovery_date_time=row.discovery_date_time,
                corrective_date_time=row.corrective_date_time,
                status=row.status,
                remarks=row.remarks,
                maintenance_delay=row.maintenance_delay,
                fault_work_unit_code=row.fault_work_unit_code,
                source=row.source,
            )
        )

    try:
        Fault.objects.bulk_create(objects_to_create)
    except Exception as e:
        return HttpResponse(f"Error transforming Faults: {e}", status=400)

    RawSyncTimestamp.objects.create(table="aircraft_rawfault", most_recent_sync=start_sync)

    return f"Created {len(objects_to_create)} Faults, Updated {update_count}"
