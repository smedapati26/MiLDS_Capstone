# app/back_end/urls.py
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
]
