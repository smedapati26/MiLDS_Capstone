from django.urls import path
from ninja import NinjaAPI

from .api import router as notifications_router

api = NinjaAPI()

api.add_router("/notifications/", notifications_router)

urlpatterns = [
    path("api/", api.urls),
]
