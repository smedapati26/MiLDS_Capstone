from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),

    # CSRF bootstrap for React
    path("api/csrf/", views.csrf_bootstrap, name="csrf-bootstrap"),

    # JSON API
    path("api/aircraft/", views.aircraft_list, name="aircraft-list"),
    path("api/aircraft/<int:pk>/", views.aircraft_detail, name="aircraft-detail"),
    path("api/personnel/", views.personnel_list, name="personnel-list"),
    path("api/personnel/<str:pk>/", views.personnel_detail, name="personnel-detail"),

    # Aircraft HTML
    path("aircraft/", views.list_aircraft, name="list_aircraft"),
    path("aircraft/create/", views.create_aircraft, name="create_aircraft"),
    path("aircraft/<int:pk>/edit/", views.update_aircraft, name="update_aircraft"),
    path("aircraft/<int:pk>/delete/", views.delete_aircraft, name="delete_aircraft"),

    # Personnel HTML
    path("personnel/", views.list_personnel, name="list_personnel"),
    path("personnel/create/", views.create_personnel, name="create_personnel"),
    path("personnel/<str:pk>/edit/", views.update_personnel, name="update_personnel"),
    path("personnel/<str:pk>/delete/", views.delete_personnel, name="delete_personnel"),

    # Scenarios HTML
    path("scenarios/", views.scenario_list, name="scenario_list"),
    path("scenarios/<int:pk>/run/", views.scenario_run, name="scenario_run"),
    path("scenarios/runs/<int:pk>/", views.scenario_run_detail, name="scenario_run_detail"),

    # Scenarios API
    path("api/scenarios/", views.scenarios_api_list, name="scenarios-api-list"),
    path("api/scenarios/revert-last/", views.revert_last_scenario, name="scenarios-revert-last"),
    path("api/scenario-runs/<int:run_id>/revert/", views.revert_scenario_run, name="scenario-run-revert"),
]
