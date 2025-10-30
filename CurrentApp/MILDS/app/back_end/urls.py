# app/back_end/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("api/aircraft/", views.aircraft_list, name="aircraft-list"),
    path("api/aircraft/<int:pk>/", views.aircraft_detail, name="aircraft-detail"),
]
