"""
amap URL Configuration
"""

import os

from django.contrib import admin
from django.urls import include, path

from forms.views import index

from .api import api

uris = [
    path("", index),
    path("admin/", admin.site.urls),
    path("data/v1/", api.urls),
    path("personnel/", include("personnel.urls")),
    path("forms/", include("forms.urls")),
    path("tasks/", include("tasks.urls")),
    path("notifications/", include("notifications.urls")),
    path("faults/", include("faults.urls")),
]

if "URI_PREFIX" in os.environ:
    prefix = os.environ["URI_PREFIX"]
    urlpatterns = [path(f"{prefix}/", include(uris))]
else:
    urlpatterns = uris
