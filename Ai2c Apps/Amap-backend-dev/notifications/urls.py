from django.urls import path

from notifications.views import get_user_notifications, mark_notification_as_read

app_name = "notifications"

urlpatterns = [
    # Get notifications views
    path("get_notifications", get_user_notifications, name="get_user_notifications"),
    path("mark_as_read/<int:id>/<str:read_all>", mark_notification_as_read, name="mark_notification_as_read"),
]
