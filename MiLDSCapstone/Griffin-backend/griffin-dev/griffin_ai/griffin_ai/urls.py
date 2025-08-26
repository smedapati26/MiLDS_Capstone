"""
griffin_ai URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from auto_dsr import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.index),
    path("auto_dsr/", include("auto_dsr.urls")),
    path("raw_schema/", include("raw_schema.urls")),
    path("agse/", include("agse.urls")),
    path("phase_sched/", include("phase_sched.urls")),
    path("aircraft/", include("aircraft.urls")),
    #MiLDS API
    #path("api/aircraft/", include("aircraft.urls")),
    #path("", include("MiLDS.Milds_App.urls")),

    path("uas/", include("uas.urls")),
    path("supply/", include("supply.urls")),
    path("fhp/", include("fhp.urls")),
    path("reports/", include("reports.urls")),
]
