"""
griffin_ai URL Configuration
"""

import os

from django.contrib import admin
from django.urls import include, path

from auto_dsr import views

from .api import api

uris = [
    path("admin/", admin.site.urls),
    path("", views.index),
    path("data/", api.urls),
    path("auto_dsr/", include("auto_dsr.urls")),
    path("raw_schema/", include("raw_schema.urls")),
    path("agse/", include("agse.urls")),
    path("phase_sched/", include("phase_sched.urls")),
    path("aircraft/", include("aircraft.urls")),
    path("uas/", include("uas.urls")),
    path("supply/", include("supply.urls")),
    path("fhp/", include("fhp.urls")),
    path("reports/", include("reports.urls")),
    path("personnel/", include("personnel.urls")),
]


if "URI_PREFIX" in os.environ:
    prefix = os.environ["URI_PREFIX"]
    urlpatterns = [path(f"{prefix}/", include(uris))]
else:
    urlpatterns = uris
