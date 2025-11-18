"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
'''
from django.contrib import admin
from django.urls import path

from django.urls import path, include
from .views import csrf_bootstrap

urlpatterns = [
    path("api/csrf/", csrf_bootstrap),
    path("api/aircraft/", aircraft_list),
    path("api/personnel/", personnel_list),
]
'''
from django.urls import path
from . import views

urlpatterns = [
    # JSON API
    path("api/aircraft/", views.aircraft_list, name="aircraft-list"),
    path("api/aircraft/<int:pk>/", views.aircraft_detail, name="aircraft-detail"),

    # Aircraft HTML
    path("aircraft/", views.list_aircraft, name="list_aircraft"),
    path("aircraft/create/", views.create_aircraft, name="create_aircraft"),
    path("aircraft/<int:pk>/edit/", views.update_aircraft, name="update_aircraft"),
    path("aircraft/<int:pk>/delete/", views.delete_aircraft, name="delete_aircraft"),

    # Personnel HTML
    path("personnel/", views.list_personnel, name="list_personnel"),
    path("personnel/create/", views.create_personnel, name="create_personnel"),
    path("personnel/<int:pk>/edit/", views.update_personnel, name="update_personnel"),
    path("personnel/<int:pk>/delete/", views.delete_personnel, name="delete_personnel"),

    # Scenarios
    path("scenarios/", views.scenario_list, name="scenario_list"),
    path("scenarios/<int:pk>/run/", views.scenario_run, name="scenario_run"),
    path("scenarios/runs/<int:pk>/", views.scenario_run_detail, name="scenario_run_detail"),

]
