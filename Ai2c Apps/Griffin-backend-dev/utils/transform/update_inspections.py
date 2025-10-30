import pandas as pd

from aircraft.models import Aircraft, Inspection


def update_inspection(the_aircraft: Aircraft, hours_till_due: float, hours_interval: int) -> None:
    """
    Updates a single inspection record for an Aircraft

    @param the_aircraft: (aircraft.models.Aircraft) the aircraft the inspection relates to
    @param hours_till_due: (float) the hours until this inspection is due on this aircraft
    @param hours_interval: (float) the interval for the inspection being updated (in hours)
    """
    if pd.isna(hours_till_due):
        return
    name = f"{hours_interval} Hour"
    try:  # to get the inspection
        insp = Inspection.objects.get(serial=the_aircraft, inspection_name=name)
    except Inspection.DoesNotExist:
        insp = Inspection(serial=the_aircraft, inspection_name=name, hours_interval=hours_interval)
    hours_since = round(hours_interval - hours_till_due, 1)
    new_last_conducted_hours = round(the_aircraft.total_airframe_hours - hours_since, 1)
    if insp.last_conducted_hours == new_last_conducted_hours:
        return
    insp.last_conducted_hours = new_last_conducted_hours
    insp.next_due_hours = round(the_aircraft.total_airframe_hours + hours_till_due, 1)
    insp.save()


def update_inspections(the_aircraft: Aircraft, insp_1: float, insp_2: float, insp_3: float, source: str) -> None:
    """
    Updates an aircraft's inspection records based on DSR records

    @param the_aircraft: (aircraft.models.Aircraft) the aircraft to update inspection records for
    @param insp_1: (float) the shortest inspection window tracked by the Vantage DSR
    @param insp_2: (float) the second shortest inspection window tracked by the Vantage DSR
    @param insp_3: (float) the longest inspection window tracked by the Vantage DSR
    @param source: (str) the data source in Vantage
    """
    if source == "GCSS":  # Inspections data from GCSS-A is unreliable and cannot be referenced
        return
    if the_aircraft.model[1:5] == "H-47":
        update_inspection(the_aircraft, insp_1, 40)
        update_inspection(the_aircraft, insp_2, 160)
        update_inspection(the_aircraft, insp_3, 320)
    elif the_aircraft.model[1:5] == "H-60":
        update_inspection(the_aircraft, insp_1, 40)
        update_inspection(the_aircraft, insp_2, 120)
    elif the_aircraft.model[1:5] == "H-64":
        update_inspection(the_aircraft, insp_1, 50)
        update_inspection(the_aircraft, insp_2, 125)
        update_inspection(the_aircraft, insp_3, 250)
    elif the_aircraft.model[1:5] == "H-72":
        update_inspection(the_aircraft, insp_1, 50)
        update_inspection(the_aircraft, insp_2, 100)
        update_inspection(the_aircraft, insp_3, 400)
    else:
        return
