from django.urls import path

from . import views

urlpatterns = [
    path("transform/manual_inspections", views.transform_inspections),
]
