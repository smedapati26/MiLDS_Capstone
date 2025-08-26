# aircraft/api_urls.py
from django.urls import path
from aircraft.views import aircraft_for_milds

urlpatterns = [
  # API view
  path("<str:uic>/", aircraft_for_milds, name="aircraft_for_milds"),
]
