"""
amap URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from forms.views import index

urlpatterns = [
    path("", index),
    path("admin/", admin.site.urls),
    path("personnel/", include("personnel.urls")),
    path("forms/", include("forms.urls")),
    path("tasks/", include("tasks.urls")),
]
