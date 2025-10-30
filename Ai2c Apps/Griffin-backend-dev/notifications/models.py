from datetime import date, datetime

from django.core.mail import send_mail
from django.db import models
from polymorphic.models import PolymorphicModel

from auto_dsr.models import Login, ObjectTransferRequest, User, UserRequest, UserRole, UserRoleAccessLevel


class Notification(PolymorphicModel):
    """
    Defines the basic notification class, with basic information about the notification
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    date_generated = models.DateTimeField("Date Generated")

    def short_display(self):
        return "Notification"

    def verbose_display(self):
        return "Notification generated on {}".format(self.date_generated.date())

    def send_notification_to_all(self):
        # Send Notification to all users who have logged onto Griffin
        unique_users = Login.objects.values_list("user_id", flat=True).distinct()
        users = User.objects.filter(user_id__in=unique_users)
        for user in users:
            user_notification, _ = UserNotification.objects.get_or_create(user=user, notification=self)
            if user.receive_emails:
                user_notification.email_notification()

    def send_notification_to_all_admins(self):
        # Send Notification to all Admin users
        unique_admins = (
            UserRole.objects.filter(access_level=UserRoleAccessLevel.ADMIN).values_list("user_id", flat=True).distinct()
        )
        users = User.objects.filter(user_id__in=unique_admins)
        for user in users:
            user_notification, _ = UserNotification.objects.get_or_create(user=user, notification=self)
            if user.receive_emails:
                user_notification.email_notification()

    def send_notification_to_all_recorders(self):
        # Send Notification to all Evaluators, Managers, and Admins (people who can enter records)
        unique_recorders = (
            UserRole.objects.exclude(access_level=UserRoleAccessLevel.READ).values_list("user_id", flat=True).distinct()
        )
        users = User.objects.filter(user_id__in=unique_recorders)
        for user in users:
            user_notification, _ = UserNotification.objects.get_or_create(user=user, notification=self)
            if user.receive_emails:
                user_notification.email_notification()


class UserNotification(models.Model):
    """
    Defines a Notification for a Specific User
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id")
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, db_column="notification_id")
    notification_read = models.BooleanField("Notification Read", default=False)

    def __str__(self):
        return "Notification generated for {} {} {} on {}. Notification read: {}".format(
            self.user.rank,
            self.user.first_name,
            self.user.last_name,
            self.notification.date_generated,
            self.notification_read,
        )

    def email_notification(self):
        """
        Send an email with the notification information to the user (if e-mail on file)

        Potentially use for scheduled emails in future by looking at notification_read and sending follow-up emails
        """
        email_body = self.notification.verbose_display()

        if self.notification.__class__.__name__ == "ReleaseNotification":
            email_body = email_body + "\n\n" + self.notification.release_url
        elif self.notification.__class__.__name__ == "AnnouncementNotification":
            email_body = email_body + "\n\n" + self.notification.announcement_url
        elif self.notification.__class__.__name__ == "BugfixNotification":
            email_body = email_body + "\n\n" + self.notification.bugfix_url

        email_body = (
            email_body
            + "\n\n\n\n To Unsubscribe from Griffin E-mail Notifications, please visit Griffin (https://apps.dse.futures.army.mil/griffin/) and click on User Profile -> Notification Settings"
        )

        send_mail(
            "[GRIFFIN] - " + self.notification.short_display(),
            email_body,
            "usarmy.griffin@army.mil",
            [self.user.email],
            fail_silently=False,
        )


class AccessRequestNotification(Notification):
    """
    Defines a notification regarding the creation of a UserRequest (Elevated Access Request)
    """

    access_request = models.ForeignKey(UserRequest, on_delete=models.CASCADE, db_column="access_request_id")

    class Meta:
        db_table = "notifications_access_requests"

    def __str__(self):
        return "Notification for {}".format(self.access_request)

    def short_display(self):
        return self.access_request.short_display()

    def verbose_display(self):
        return self.access_request.verbose_display()


class TransferRequestNotification(Notification):
    """
    Defines a notification regarding an ObjectTransferRequest being created
    """

    transfer_request = models.ForeignKey(
        ObjectTransferRequest, on_delete=models.CASCADE, db_column="transfer_request_id"
    )

    class Meta:
        db_table = "notifications_transfer_requests"

    def __str__(self):
        return "Notification for {}".format(self.transfer_request)

    def short_display(self):
        return self.transfer_request.short_display()

    def verbose_display(self):
        return self.transfer_request.verbose_display()


class ApprovedDeniedNotification(Notification):
    """
    Defines a notification for a user regarding the status of one of their UserRequests or TransferRequests
    """

    request_type = models.CharField("Type of Request", max_length=48)
    request_action = models.TextField("Action Requested", max_length=256)
    approved_denied = models.CharField("Type of Request", max_length=48)

    class Meta:
        db_table = "notifications_approved_denied"

    def __str__(self):
        return "Notification for {} : {}".format(self.request_type, self.approved_denied)

    def short_display(self):
        return "{} {}".format(self.request_type, self.approved_denied)

    def verbose_display(self):
        return "Your {} for {} has been {}".format(self.request_type, self.request_action, self.approved_denied)


class ReleaseNotification(Notification):
    """
    Defines a notification for a user regarding the creation of a UserTransferRequest
    """

    release_version = models.CharField("Release Version Number", max_length=15)
    release_notes = models.TextField("Release Notes", max_length=1024)
    release_url = models.TextField("Release Notes Teams URL", max_length=512)

    class Meta:
        db_table = "notifications_version_release"

    def __str__(self):
        return "Griffin {} Release Notification".format(self.release_version)

    def short_display(self):
        return "Griffin Version {}".format(self.release_version)

    def verbose_display(self):
        return self.release_notes


class AnnouncementNotification(Notification):
    """
    Defines a notification for an Announcement for Griffin Users
    """

    title = models.CharField("Announcement Title", max_length=32)
    announcement = models.TextField("Annoucement", max_length=1024)
    announcement_url = models.TextField("Announcement Teams URL", max_length=512)

    class Meta:
        db_table = "notifications_announcement"

    def __str__(self):
        return "Griffin Announcement: {}".format(self.title)

    def short_display(self):
        return self.title

    def verbose_display(self):
        return self.announcement


class BugfixNotification(Notification):
    """
    Defines a notification for a new bugfix or patch
    """

    bugfix = models.CharField("Bugfix short display", max_length=32)
    bugfix_details = models.TextField("Bugfix details", max_length=1024)
    bugfix_url = models.TextField("Bugfix Teams URL", max_length=512)

    class Meta:
        db_table = "notifications_bugfix"

    def __str__(self):
        return "Griffin: {}".format(self.bugfix)

    def short_display(self):
        return self.bugfix

    def verbose_display(self):
        return self.bugfix_details
