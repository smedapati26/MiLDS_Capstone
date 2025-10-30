from django.db.models import Value as V
from django.db.models.functions import Concat
from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, HttpResponseServerError
from django.views.decorators.http import require_http_methods

from notifications.models import SoldierNotification
from personnel.models import Soldier
from utils.http.constants import (
    HTTP_200_NOTIFICATION_READ,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_NOTIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
)


@require_http_methods(["PUT"])
def mark_notification_as_read(request: HttpRequest, id: int, read_all: str = "False"):
    """
    Marks notification as read
    """
    current_user_id = request.META.get("HTTP_X_ON_BEHALF_OF")
    if current_user_id is None:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    try:
        current_user = Soldier.objects.get(user_id=current_user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    if read_all == "True":
        soldier_notifications = SoldierNotification.objects.filter(soldier=current_user, notification_read=False)
        for notification in soldier_notifications:
            notification.notification_read = True
            notification.save()
    else:
        try:
            notification = SoldierNotification.objects.get(id=id)
            notification.notification_read = True
            notification.save()
        except SoldierNotification.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_NOTIFICATION_DOES_NOT_EXIST)

    return HttpResponse(HTTP_200_NOTIFICATION_READ)
