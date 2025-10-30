from typing import List

from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.responses import codes_4xx

from auto_dsr.models import User, UserRequest
from notifications.api.notifications.schema import (
    AccessRequestNotificationIn,
    AccessRequestNotificationSchema,
    AnnouncementNotificationIn,
    AnnouncementNotificationSchema,
    ApprovedDeniedNotificationIn,
    ApprovedDeniedNotificationSchema,
    BugfixNotificationIn,
    BugfixNotificationSchema,
    NotificationIn,
    NotificationSchema,
    ReleaseNotificationIn,
    ReleaseNotificationSchema,
    TransferRequestNotificationIn,
    TransferRequestNotificationSchema,
    UserNotificationIn,
    UserNotificationSchema,
    UserRequestSchema,
)
from notifications.models import (
    AccessRequestNotification,
    AnnouncementNotification,
    ApprovedDeniedNotification,
    BugfixNotification,
    Notification,
    ObjectTransferRequest,
    ReleaseNotification,
    TransferRequestNotification,
    UserNotification,
)

notifications_router = Router()


@notifications_router.put("/base-notification/{notification_id}", response={200: NotificationSchema, codes_4xx: dict})
def update_notification(request: HttpRequest, notification_id: int, payload: NotificationIn):
    """
    Update a specific notification by ID
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep
    notification = get_object_or_404(Notification, id=notification_id)
    for attr, value in payload.dict().items():
        setattr(notification, attr, value)
    notification.save()
    return 200, {"id": notification.id, "date_generated": notification.date_generated.isoformat(), "success": True}


@notifications_router.delete("/base-notification/{notification_id}", response={204: None, codes_4xx: dict})
def delete_notification(request: HttpRequest, notification_id: int):
    """
    Delete a specific notification by ID
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep
    notification = get_object_or_404(Notification, id=notification_id)
    notification.delete()
    return 204, None


@notifications_router.post("/user-notification", response={201: dict, codes_4xx: dict})
def create_user_notification(request: HttpRequest, payload: UserNotificationIn):
    """
    Create a new user notification (admin only)
    """
    user = get_object_or_404(User, user_id=payload.user)
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep
    notif = get_object_or_404(Notification, id=payload.notification)
    user_notification = UserNotification.objects.create(
        user=user, notification=notif, notification_read=payload.notification_read
    )
    return 201, {"id": user_notification.id}


# Map a notification to the correct schema
def map_notification(notification):
    if isinstance(notification, AccessRequestNotification):
        return {
            "id": notification.id,
            "date_generated": notification.date_generated,
            "notification_type": "AccessRequestNotification",
        }
    elif isinstance(notification, TransferRequestNotification):
        return {
            "id": notification.id,
            "date_generated": notification.date_generated,
            "notification_type": "TransferRequestNotification",
            "notification_data": TransferRequestNotificationSchema.from_orm(notification).dict(),
        }
    elif isinstance(notification, ApprovedDeniedNotification):
        return {
            "id": notification.id,
            "date_generated": notification.date_generated,
            "notification_type": "ApprovedDeniedNotification",
            "notification_data": ApprovedDeniedNotificationSchema.from_orm(notification).dict(),
        }
    elif isinstance(notification, UserRequest):
        return {
            "id": notification.id,
            "date_generated": notification.date_created,
            "notification_type": "UserRequest",
            "notification_data": UserRequestSchema.from_orm(notification).dict(),
        }
    elif isinstance(notification, UserNotification):
        return {
            "id": notification.id,
            "date_generated": notification.date_generated,
            "notification_type": "UserNotification",
        }
    elif isinstance(notification, ObjectTransferRequest):
        return {
            "id": notification.id,
            "date_generated": notification.date_requested,
            "notification_read": False,
            "notification_type": "ObjectTransferRequest",
            "notification_data": {
                "id": notification.id,
                "requested_aircraft": str(notification.requested_aircraft) if notification.requested_aircraft else None,
                "requested_uac": str(notification.requested_uac) if notification.requested_uac else None,
                "requested_uav": str(notification.requested_uav) if notification.requested_uav else None,
                "requested_object_type": notification.requested_object_type,
                "originating_unit": str(notification.originating_unit),
                "originating_unit_approved": notification.originating_unit_approved,
                "destination_unit": str(notification.destination_unit),
                "destination_unit_approved": notification.destination_unit_approved,
                "requested_by_user": str(notification.requested_by_user),
                "permanent_transfer": notification.permanent_transfer,
                "date_requested": notification.date_requested,
                "status": notification.status,
                "last_updated_by": str(notification.last_updated_by) if notification.last_updated_by else None,
                "last_updated_datetime": notification.last_updated_datetime,
            },
        }
    else:
        return None


@notifications_router.get(
    "/user-notification/{notification_id}", response={200: UserNotificationSchema, codes_4xx: dict}
)
def get_user_notification(request: HttpRequest, notification_id: int):
    """
    Retrieve a specific notification by ID
    """
    user = get_object_or_404(User, user_id=request.auth.user_id)
    notification = get_object_or_404(Notification, id=notification_id)

    user_notification = UserNotification.objects.filter(notification=notification, user=user).first()
    if not request.auth.is_admin and (not user_notification or user_notification.user.user_id != user.user_id):
        return 403, {"error": "Authentication failed: User ID mismatch"}

    # Determine the specific notification type
    content_type = notification.polymorphic_ctype.model
    if content_type == "accessrequestnotification":
        specific_notification = AccessRequestNotification.objects.get(id=notification_id)
    elif content_type == "transferrequestnotification":
        specific_notification = TransferRequestNotification.objects.get(id=notification_id)
    elif content_type == "approveddeniednotification":
        specific_notification = ApprovedDeniedNotification.objects.get(id=notification_id)
    elif content_type == "objecttransferrequest":
        specific_notification = ObjectTransferRequest.objects.get(id=notification_id)
    elif content_type == "userrequest":
        specific_notification = UserRequest.objects.get(id=notification_id)
    else:
        return 404, {"error": "Notification type not supported"}

    # Map the specific notification to the correct schema
    notification_data = map_notification(specific_notification)
    if notification_data is None:
        return 404, {"error": "Notification type not supported"}

    return 200, notification_data


@notifications_router.get("/user-notification", response={200: List[UserNotificationSchema], codes_4xx: dict})
def list_user_notifications(request: HttpRequest, notification_read: bool | None = None):
    """
    List all user notifications for a specific user
    """
    user = get_object_or_404(User, user_id=request.auth.user_id)

    user_requests_query = UserRequest.objects.filter(
        user_id=user.user_id, accessrequestnotification__usernotification__notification_read=notification_read
    )
    object_transfer_requests_query = ObjectTransferRequest.objects.filter(
        requested_by_user=user.user_id,
        transferrequestnotification__usernotification__notification_read=notification_read,
    )
    access_request_notifications_query = AccessRequestNotification.objects.filter(
        access_request__user_id=user.user_id, usernotification__notification_read=notification_read
    )
    transfer_request_notifications_query = TransferRequestNotification.objects.filter(
        transfer_request__requested_by_user=user.user_id, usernotification__notification_read=notification_read
    )

    user_requests_ids = user_requests_query.values_list("id", flat=True)

    all_requests = (
        list(user_requests_query)
        + list(object_transfer_requests_query)
        + list(access_request_notifications_query.filter(access_request__id__in=user_requests_ids))
        + list(transfer_request_notifications_query)
    )
    mapped_notifications = [map_notification(notification) for notification in all_requests]
    return 200, mapped_notifications


@notifications_router.put("/user-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def update_user_notification(request: HttpRequest, notification_id: int, mark_read: bool = True):
    """
    Update whether a specific user notification is read or not
    """
    user_notification = get_object_or_404(UserNotification, id=notification_id)
    if user_notification.user.user_id != request.auth.user_id:
        return 403, {"error": "Access denied"}
    user_notification.notification_read = mark_read
    user_notification.save()
    return 200, {"success": True}


@notifications_router.delete("/user-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def delete_user_notification(request: HttpRequest, notification_id: int):
    """
    Delete a specific user notification by ID
    Non-admin user can delete own notifications
    """
    user = get_object_or_404(User, user_id=request.auth.user_id)

    user_notification = get_object_or_404(UserNotification, id=notification_id)

    # Allow deletion if the user is an admin or the owner of the notification
    if not (request.auth.is_admin or user_notification.user.user_id == user.user_id):
        return 403, {"error": "Access denied: You do not have permission to delete this notification"}

    user_notification.delete()
    return 200, {"success": True}


@notifications_router.post("/user-notification", response={201: dict, codes_4xx: dict})
def create_user_notification_admin(request: HttpRequest, payload: UserNotificationIn):
    """
    Create a new user notification (admin only)
    """
    user = get_object_or_404(User, user_id=payload.user)
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep
    notification = get_object_or_404(Notification, id=payload.notification)
    user_notification = UserNotification.objects.create(
        user=user, notification=notification, notification_read=payload.notification_read
    )
    return 201, {"id": user_notification.id}


@notifications_router.post("/access-request-notification", response={201: dict, codes_4xx: dict})
def create_access_request_notification(request: HttpRequest, payload: AccessRequestNotificationIn):
    """
    Create a new access request notification (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    access_request = get_object_or_404(UserRequest, id=payload.access_request)
    notification = AccessRequestNotification.objects.create(
        access_request=access_request,
        date_generated=payload.date_generated,
    )

    return 201, {"id": notification.id}


@notifications_router.get(
    "/access-request-notification/{notification_id}", response={200: AccessRequestNotificationSchema, codes_4xx: dict}
)
def get_access_request_notification(request: HttpRequest, notification_id: int):
    """
    Retrieve a specific access request notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(AccessRequestNotification, id=notification_id)
    return 200, notification


@notifications_router.get(
    "/access-request-notification", response={200: List[AccessRequestNotificationSchema], codes_4xx: dict}
)
def list_access_request_notifications(request: HttpRequest):
    """
    List all access request notifications (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notifications = AccessRequestNotification.objects.all()
    return 200, notifications


@notifications_router.put("/access-request-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def update_access_request_notification(
    request: HttpRequest, notification_id: int, payload: AccessRequestNotificationIn
):
    """
    Update a specific access request notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep
    notification = get_object_or_404(AccessRequestNotification, id=notification_id)
    access_request = get_object_or_404(UserRequest, id=payload.access_request)
    notification.date_generated = payload.date_generated
    notification.access_request = access_request
    notification.save()
    return 200, {"success": True}


@notifications_router.delete("/access-request-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def delete_access_request_notification(request: HttpRequest, notification_id: int):
    """
    Delete a specific access request notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(AccessRequestNotification, id=notification_id)
    notification.delete()
    return 200, {"success": True}


@notifications_router.post("/transfer-request-notification", response={201: dict, codes_4xx: dict})
def create_transfer_request_notification(request: HttpRequest, payload: TransferRequestNotificationIn):
    """
    Create a new transfer request notification (admin only)
    """

    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    try:
        transfer_request = get_object_or_404(ObjectTransferRequest, id=payload.dict().get("transfer_request"))
    except Exception:
        return 404, {"error": "Transfer request not found"}

    try:
        notification = TransferRequestNotification.objects.create(
            transfer_request=transfer_request,
            date_generated=payload.dict().get("date_generated"),
        )
    except Exception:
        return 400, {"error": "Failed to create notification"}

    return 201, {"success": True, "id": notification.id}


def create_approved_denied_notification(request: HttpRequest, payload: ApprovedDeniedNotificationIn):
    """
    Create a new approved/denied notification (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = ApprovedDeniedNotification.objects.create(**payload.dict())
    return 201, {"id": notification.id}


@notifications_router.get(
    "/transfer-request-notification/{notification_id}",
    response={200: TransferRequestNotificationSchema, codes_4xx: dict},
)
def get_transfer_request_notification(request: HttpRequest, notification_id: int):
    """
    Retrieve a specific transfer request notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(TransferRequestNotification, id=notification_id)
    return 200, notification


@notifications_router.get(
    "/transfer-request-notification", response={200: List[TransferRequestNotificationSchema], codes_4xx: dict}
)
def list_transfer_request_notifications(request: HttpRequest):
    """
    List all transfer request notifications (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    return 200, TransferRequestNotification.objects.all()


@notifications_router.put("/transfer-request-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def update_transfer_request_notification(
    request: HttpRequest, notification_id: int, payload: TransferRequestNotificationIn
):
    """
    Update a specific transfer request notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep
    notification = get_object_or_404(TransferRequestNotification, id=notification_id)
    transfer_request = get_object_or_404(ObjectTransferRequest, id=payload.transfer_request)
    notification.transfer_request = transfer_request
    notification.date_generated = payload.date_generated

    notification.save()

    return 200, {"success": True}


@notifications_router.delete("/transfer-request-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def delete_transfer_request_notification(request: HttpRequest, notification_id: int):
    """
    Delete a specific transfer request notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(TransferRequestNotification, id=notification_id)
    notification.delete()
    return 200, {"success": True}


@notifications_router.post("/approved-denied-notification", response={201: dict, codes_4xx: dict})
def create_approved_denied_notification(request: HttpRequest, payload: ApprovedDeniedNotificationIn):
    """
    Create a new approved/denied notification (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = ApprovedDeniedNotification.objects.create(**payload.dict())
    return 201, {"id": notification.id}


@notifications_router.get(
    "/approved-denied-notification/{notification_id}", response={200: ApprovedDeniedNotificationSchema, codes_4xx: dict}
)
def get_approved_denied_notification(request: HttpRequest, notification_id: int):
    """
    Retrieve a specific approved/denied notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(ApprovedDeniedNotification, id=notification_id)
    return 200, notification


@notifications_router.get(
    "/approved-denied-notification", response={200: List[ApprovedDeniedNotificationSchema], codes_4xx: dict}
)
def list_approved_denied_notifications(request: HttpRequest):
    """
    List all approved/denied notifications (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    return 200, ApprovedDeniedNotification.objects.all()


@notifications_router.put("/approved-denied-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def update_approved_denied_notification(
    request: HttpRequest, notification_id: int, payload: ApprovedDeniedNotificationIn
):
    """
    Update a specific approved/denied notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(ApprovedDeniedNotification, id=notification_id)
    for attr, value in payload.dict().items():
        setattr(notification, attr, value)
    notification.save()
    return 200, {"success": True}


@notifications_router.delete("/approved-denied-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def delete_approved_denied_notification(request: HttpRequest, notification_id: int):
    """
    Delete a specific approved/denied notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(ApprovedDeniedNotification, id=notification_id)
    notification.delete()
    return 200, {"success": True}


@notifications_router.post("/release-notification", response={201: dict, codes_4xx: dict})
def create_release_notification(request: HttpRequest, payload: ReleaseNotificationIn):
    """
    Create a new release notification (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = ReleaseNotification.objects.create(**payload.dict())
    return 201, {"id": notification.id}


@notifications_router.get(
    "/release-notification/{notification_id}", response={200: ReleaseNotificationSchema, codes_4xx: dict}
)
def get_release_notification(request: HttpRequest, notification_id: int):
    """
    Retrieve a specific release notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(ReleaseNotification, id=notification_id)
    return 200, notification


@notifications_router.get("/release-notification", response={200: List[ReleaseNotificationSchema], codes_4xx: dict})
def list_release_notifications(request: HttpRequest):
    """
    List all release notifications (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    return 200, ReleaseNotification.objects.all()


@notifications_router.put("/release-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def update_release_notification(request: HttpRequest, notification_id: int, payload: ReleaseNotificationIn):
    """
    Update a specific release notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(ReleaseNotification, id=notification_id)
    for attr, value in payload.dict().items():
        setattr(notification, attr, value)
    notification.save()
    return 200, {"success": True}


@notifications_router.delete("/release-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def delete_release_notification(request: HttpRequest, notification_id: int):
    """
    Delete a specific release notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(ReleaseNotification, id=notification_id)
    notification.delete()
    return 200, {"success": True}


@notifications_router.post("/announcement-notification", response={201: dict, codes_4xx: dict})
def create_announcement_notification(request: HttpRequest, payload: AnnouncementNotificationIn):
    """
    Create a new announcement notification (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = AnnouncementNotification.objects.create(**payload.dict())
    return 201, {"id": notification.id}


@notifications_router.get(
    "/announcement-notification/{notification_id}", response={200: AnnouncementNotificationSchema, codes_4xx: dict}
)
def get_announcement_notification(request: HttpRequest, notification_id: int):
    """
    Retrieve a specific announcement notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(AnnouncementNotification, id=notification_id)
    return 200, notification


@notifications_router.get(
    "/announcement-notification", response={200: List[AnnouncementNotificationSchema], codes_4xx: dict}
)
def list_announcement_notifications(request: HttpRequest):
    """
    List all announcement notifications (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    return 200, AnnouncementNotification.objects.all()


@notifications_router.put("/announcement-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def update_announcement_notification(request: HttpRequest, notification_id: int, payload: AnnouncementNotificationIn):
    """
    Update a specific announcement notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(AnnouncementNotification, id=notification_id)
    for attr, value in payload.dict().items():
        setattr(notification, attr, value)
    notification.save()
    return 200, {"success": True}


@notifications_router.delete("/announcement-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def delete_announcement_notification(request: HttpRequest, notification_id: int):
    """
    Delete a specific announcement notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(AnnouncementNotification, id=notification_id)
    notification.delete()
    return 200, {"success": True}


@notifications_router.post("/bugfix-notification", response={201: dict, codes_4xx: dict})
def create_bugfix_notification(request: HttpRequest, payload: BugfixNotificationIn):
    """
    Create a new bugfix notification (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = BugfixNotification.objects.create(**payload.dict())
    return 201, {"id": notification.id}


@notifications_router.get(
    "/bugfix-notification/{notification_id}", response={200: BugfixNotificationSchema, codes_4xx: dict}
)
def get_bugfix_notification(request: HttpRequest, notification_id: int):
    """
    Retrieve a specific bugfix notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(BugfixNotification, id=notification_id)
    return 200, notification


@notifications_router.get("/bugfix-notification", response={200: List[BugfixNotificationSchema], codes_4xx: dict})
def list_bugfix_notifications(request: HttpRequest):
    """
    List all bugfix notifications (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    return 200, BugfixNotification.objects.all()


@notifications_router.put("/bugfix-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def update_bugfix_notification(request: HttpRequest, notification_id: int, payload: BugfixNotificationIn):
    """
    Update a specific bugfix notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(BugfixNotification, id=notification_id)
    for attr, value in payload.dict().items():
        setattr(notification, attr, value)
    notification.save()
    return 200, {"success": True}


@notifications_router.delete("/bugfix-notification/{notification_id}", response={200: dict, codes_4xx: dict})
def delete_bugfix_notification(request: HttpRequest, notification_id: int):
    """
    Delete a specific bugfix notification by ID (admin only)
    """
    if not request.auth or not request.auth.is_admin:
        return 403, {"error": "Admin access required"}  # nosemgrep

    notification = get_object_or_404(BugfixNotification, id=notification_id)
    notification.delete()
    return 200, {"success": True}
