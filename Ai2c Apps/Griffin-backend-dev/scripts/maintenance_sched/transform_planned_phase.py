from aircraft.models import InspectionReference
from events.model_utils import MaintenanceTypes
from events.models import MaintenanceEvent, MaintenanceLane
from phase_sched.models import PlannedPhase

for planned_phase in PlannedPhase.objects.all():
    mtn_lane = MaintenanceLane.objects.get(unit=planned_phase.lane.unit, name=planned_phase.lane.name)
    phase_type = planned_phase.phase_type
    phase_type_attr = f"insp_{phase_type.lower().replace(' ', '_')}"
    maint_type = getattr(MaintenanceTypes, phase_type_attr, MaintenanceTypes.OTHER)
    model = planned_phase.aircraft.model
    if "-60" in model:
        if phase_type == "48 Month":
            insp_ref = InspectionReference.objects.filter(model=model, common_name="48MO PMI").first()
        elif phase_type == "480":
            insp_ref = InspectionReference.objects.filter(model=model, common_name="PMI-1").first()
        elif phase_type == "960":
            insp_ref = InspectionReference.objects.filter(model=model, common_name="PMI-2").first()
        else:
            insp_ref = None
    elif "-64" in model:
        if phase_type == "250":
            insp_ref = InspectionReference.objects.filter(model=model, common_name="250HR INSP").first()
        elif phase_type == "500":
            insp_ref = InspectionReference.objects.filter(model=model, common_name="500HR PHASE").first()
        else:
            insp_ref = None
    elif "-47" in model:
        if phase_type == "320":
            insp_ref = InspectionReference.objects.filter(model=model, common_name="320HR INSP - C1").first()
        elif phase_type == "640":
            insp_ref = InspectionReference.objects.filter(model=model, common_name="640HR PHASE - C2").first()
        elif phase_type == "1920":
            insp_ref = InspectionReference.objects.filter(model=model, common_name="640HR INSP - C4").first()
        else:
            insp_ref = None
    else:
        insp_ref = None

    if insp_ref == None:
        maintenance_type = "OTHER"
    else:
        maintenance_type = "INSP"

    mtn_event = MaintenanceEvent.objects.create(
        event_start=planned_phase.start_date,
        event_end=planned_phase.end_date,
        aircraft=planned_phase.aircraft,
        lane=mtn_lane,
        notes=planned_phase.phase_type,
        maintenance_type="INSP",
        inspection_reference=insp_ref,
    )
