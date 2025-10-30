from django.db.models import Value as V
from django.db.models.functions import Concat
from django.http import HttpRequest, HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.views.decorators.http import require_GET

from notifications.models import SoldierNotification
from personnel.models import Soldier
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER


@require_GET
def get_user_notifications(request: HttpRequest):
    """
    Gets all unread notifications for a user
    """
    current_user_id = request.META.get("HTTP_X_ON_BEHALF_OF")
    if current_user_id is None:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    try:
        current_user = Soldier.objects.get(user_id=current_user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)
    # Get unread soldier notifications
    soldier_notifications = SoldierNotification.objects.filter(soldier=current_user, notification_read=False).order_by(
        "-notification__date_generated"
    )

    notifications = []

    # Add relevant data for each notification type to returned data
    for soldier_notification in soldier_notifications:
        notification = soldier_notification.notification

        teams_url = "N/A"
        if notification.__class__.__name__ == "ReleaseNotification":
            teams_url = notification.release_url
        elif notification.__class__.__name__ == "AnnouncementNotification":
            teams_url = notification.announcement_url
        elif notification.__class__.__name__ == "BugfixNotification":
            teams_url = notification.bugfix_url

        notifications.append(
            {
                "id": soldier_notification.id,
                "type": notification.__class__.__name__,
                "short_display": notification.short_display(),
                "verbose_display": notification.verbose_display(),
                "datetime": notification.date_generated,
                "approved": (
                    notification.approved_denied.title()
                    if notification.__class__.__name__ == "ApprovedDeniedNotification"
                    else "N/A"
                ),
                "teams_url": teams_url,
            }
        )

    return JsonResponse({"notifications": notifications})
