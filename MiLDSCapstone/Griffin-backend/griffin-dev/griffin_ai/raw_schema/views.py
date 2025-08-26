from django.http import HttpResponse

from aircraft.models import Aircraft, Inspection
from raw_schema.models import ManualInspection


def inspection_name(model, inspection_number):
    ch_insp = {"insp_1": "40 Hour", "insp_2": "160 Hour", "insp_3": "320 Hour"}
    uh_insp = {"insp_1": "40 Hour", "insp_2": "120 Hour"}
    ah_insp = {"insp_1": "50 Hour", "insp_2": "125 Hour", "insp_3": "250 Hour"}
    luh_insp = {"insp_1": "50 Hour", "insp_2": "100 Hour", "insp_3": "400 Hour"}

    if model[1:5] == "H-47":
        return ch_insp[inspection_number]
    elif model[1:5] == "H-60":
        return uh_insp[inspection_number]
    elif model[1:5] == "H-64":
        return ah_insp[inspection_number]
    else:
        return luh_insp[inspection_number]


def inspection_interval(model, inspection_number):
    ch_insp = {"insp_1": 40, "insp_2": 160, "insp_3": 320}
    uh_insp = {"insp_1": 40, "insp_2": 120}
    ah_insp = {"insp_1": 50, "insp_2": 125, "insp_3": 250}
    luh_insp = {"insp_1": 50, "insp_2": 100, "insp_3": 400}

    if model[1:5] == "H-47":
        return ch_insp[inspection_number]
    elif model[1:5] == "H-60":
        return uh_insp[inspection_number]
    elif model[1:5] == "H-64":
        return ah_insp[inspection_number]
    else:
        return luh_insp[inspection_number]


def transform_inspections(request):
    for manual_inspections in ManualInspection.objects.all():
        try:
            aircraft = Aircraft.objects.get(serial=manual_inspections.serial)
        except Aircraft.DoesNotExist:
            continue
        # insp_1
        if manual_inspections.insp_1 != None:
            insp_name = inspection_name(aircraft.model, "insp_1")
            insp_interval = inspection_interval(aircraft.model, "insp_1")
            inspection, created = Inspection.objects.get_or_create(serial=aircraft, inspection_name=insp_name)
            inspection.last_conducted_hours = manual_inspections.insp_1 - insp_interval
            inspection.hours_interval = insp_interval
            inspection.next_due_hours = manual_inspections.insp_1
            inspection.save()
        # insp_2
        if manual_inspections.insp_2 != None:
            insp_name = inspection_name(aircraft.model, "insp_2")
            insp_interval = inspection_interval(aircraft.model, "insp_2")
            inspection, created = Inspection.objects.get_or_create(serial=aircraft, inspection_name=insp_name)
            inspection.last_conducted_hours = manual_inspections.insp_2 - insp_interval
            inspection.hours_interval = insp_interval
            inspection.next_due_hours = manual_inspections.insp_2
            inspection.save()
        # insp_3
        if manual_inspections.insp_3 != None:
            insp_name = inspection_name(aircraft.model, "insp_3")
            insp_interval = inspection_interval(aircraft.model, "insp_3")
            inspection, created = Inspection.objects.get_or_create(serial=aircraft, inspection_name=insp_name)
            inspection.last_conducted_hours = manual_inspections.insp_3 - insp_interval
            inspection.hours_interval = insp_interval
            inspection.next_due_hours = manual_inspections.insp_3
            inspection.save()

    return HttpResponse("Success")
