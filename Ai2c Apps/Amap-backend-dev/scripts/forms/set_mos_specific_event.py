from timeit import default_timer as timer

from forms.models import Event
from personnel.models import Soldier


def set_mos_specific_events():
    start = timer()
    for soldier in Soldier.objects.all():
        soldier_events = Event.objects.filter(soldier=soldier, event_deleted=False).order_by("date")
        current_ml = None
        for event in soldier_events:
            try:
                # Add MOS to events for evaluations and progression events, otherwise leave blank (generic training)
                if event.event_type.type == "Evaluation":
                    event.mos = soldier.primary_mos
                    current_ml = event.maintenance_level
                elif event.maintenance_level != current_ml:
                    event.mos = soldier.primary_mos
                    current_ml = event.maintenance_level
                event.save()
            except:
                pass
    end = timer()
    print("Time Elapsed: ", end - start)


set_mos_specific_events()
