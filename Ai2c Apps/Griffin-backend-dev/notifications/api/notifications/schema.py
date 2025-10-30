from datetime import datetime

from ninja import ModelSchema, Schema

from notifications.models import (
    AccessRequestNotification,
    AnnouncementNotification,
    ApprovedDeniedNotification,
    BugfixNotification,
    Notification,
    ReleaseNotification,
    TransferRequestNotification,
    UserNotification,
    UserRequest,
)


class NotificationSchema(ModelSchema):
    class Meta:
        model = Notification
        fields = ["id", "date_generated"]


class NotificationIn(ModelSchema):
    class Meta:
        model = Notification
        fields = ["date_generated"]


class AccessRequestNotificationSchema(ModelSchema):
    class Meta:
        model = AccessRequestNotification
        fields = ["id", "date_generated", "access_request"]


class AccessRequestNotificationIn(ModelSchema):
    class Meta:
        model = AccessRequestNotification
        fields = ["date_generated", "access_request"]


class TransferRequestNotificationSchema(ModelSchema):
    class Meta:
        model = TransferRequestNotification
        fields = ["id", "date_generated", "transfer_request"]


class TransferRequestNotificationIn(ModelSchema):
    class Meta:
        model = TransferRequestNotification
        fields = ["date_generated", "transfer_request"]


class ApprovedDeniedNotificationSchema(ModelSchema):
    class Meta:
        model = ApprovedDeniedNotification
        fields = ["id", "date_generated", "request_type", "request_action", "approved_denied"]


class ApprovedDeniedNotificationIn(ModelSchema):
    class Meta:
        model = ApprovedDeniedNotification
        fields = ["date_generated", "request_type", "request_action", "approved_denied"]


class ReleaseNotificationSchema(ModelSchema):
    class Meta:
        model = ReleaseNotification
        fields = ["id", "date_generated", "release_version", "release_notes", "release_url"]


class ReleaseNotificationIn(ModelSchema):
    class Meta:
        model = ReleaseNotification
        fields = ["date_generated", "release_version", "release_notes", "release_url"]


class AnnouncementNotificationSchema(ModelSchema):
    class Meta:
        model = AnnouncementNotification
        fields = ["id", "date_generated", "title", "announcement", "announcement_url"]


class AnnouncementNotificationIn(ModelSchema):
    class Meta:
        model = AnnouncementNotification
        fields = ["date_generated", "title", "announcement", "announcement_url"]


class BugfixNotificationSchema(ModelSchema):
    class Meta:
        model = BugfixNotification
        fields = ["id", "date_generated", "bugfix", "bugfix_details", "bugfix_url"]


class BugfixNotificationIn(ModelSchema):
    class Meta:
        model = BugfixNotification
        fields = ["date_generated", "bugfix", "bugfix_details", "bugfix_url"]


class UserRequestSchema(ModelSchema):
    class Meta:
        model = UserRequest
        fields = ["id", "date_created", "date_updated", "user_id", "uic", "access_level", "status"]


class UserNotificationSchema(Schema):
    id: int
    date_generated: datetime
    notification_type: str

    class Meta:
        model = UserNotification


class UserNotificationIn(Schema):
    user: str
    notification: int
    notification_read: bool

    class Meta:
        model = UserNotification
        fields = ["user", "notification", "notification_read"]
