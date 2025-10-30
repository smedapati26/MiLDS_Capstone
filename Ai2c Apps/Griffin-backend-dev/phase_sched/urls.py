from django.urls import path

from phase_sched.views import get_aircraft_inspections, get_lane, get_lanes, get_phase, get_phases
from phase_sched.views.crud import (
    create_phase_lane,
    create_planned_phase,
    delete_phase_lane,
    delete_planned_phase,
    update_phase_lane,
    update_planned_phase,
)

urlpatterns = [
    path("get_lanes/<str:uic>", get_lanes, name="get_lanes"),
    path("get_lane/<int:id>", get_lane, name="get_lane"),
    path("get_phases/<str:uic>", get_phases, name="get_phases"),
    path("get_phase/<int:id>", get_phase, name="get_phase"),
    path(
        "inspection_type/<str:serial>",
        get_aircraft_inspections,
        name="get_aircraft_inspections",
    ),
    path("lane/create", create_phase_lane, name="create_phase_lane"),
    path("lane/update", update_phase_lane, name="edit_lane"),
    path("lane/delete", delete_phase_lane, name="delete_lane"),
    path("phase/create", create_planned_phase, name="create_phase"),
    path("phase/update", update_planned_phase, name="edit_phase"),
    path("phase/delete", delete_planned_phase, name="delete_phase"),
]
