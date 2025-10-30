from datetime import date, datetime

from django.core.mail import send_mail, send_mass_mail
from django.db import models
from polymorphic.models import PolymorphicModel

from personnel.models import Login, Soldier, SoldierTransferRequest, UserRequest, UserRole, UserRoleAccessLevel


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
        # Send Notification to all soldiers who have logged onto A-MAP
        unique_users = Login.objects.values_list("user", flat=True).distinct()
        soldiers = Soldier.objects.filter(user_id__in=unique_users)
        for soldier in soldiers:
            soldier_notification, _ = SoldierNotification.objects.get_or_create(soldier=soldier, notification=self)
            if soldier.recieve_emails:
                soldier_notification.email_notification()

    def send_notification_to_all_managers(self):
        # Send Notification to all managers users
        unique_managers = (
            UserRole.objects.filter(access_level=UserRoleAccessLevel.MANAGER)
            .values_list("user_id", flat=True)
            .distinct()
        )
        soldiers = Soldier.objects.filter(user_id__in=unique_managers)
        for soldier in soldiers:
            soldier_notification, _ = SoldierNotification.objects.get_or_create(soldier=soldier, notification=self)
            if soldier.recieve_emails:
                soldier_notification.email_notification()

    def send_notification_to_all_recorders(self):
        # Send Notification to all Evaluators, Managers, and Admins (people who can enter records)
        unique_recorders = (
            UserRole.objects.exclude(access_level=UserRoleAccessLevel.VIEWER)
            .values_list("user_id", flat=True)
            .distinct()
        )
        soldiers = Soldier.objects.filter(user_id__in=unique_recorders)
        for soldier in soldiers:
            soldier_notification, _ = SoldierNotification.objects.get_or_create(soldier=soldier, notification=self)
            if soldier.recieve_emails:
                soldier_notification.email_notification()


class SoldierNotification(models.Model):
    """
    Defines a Notification for a Specific Soldier
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    soldier = models.ForeignKey(Soldier, on_delete=models.CASCADE, db_column="user_id")
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, db_column="notification_id")
    notification_read = models.BooleanField("Notification Read", default=False)

    def __str__(self):
        return "Notification generated for {} {} {} on {}. Notification read: {}".format(
            self.soldier.rank,
            self.soldier.first_name,
            self.soldier.last_name,
            self.notification.date_generated,
            self.notification_read,
        )

    def email_notification(self):
        """
        Send an email with the notification information to the soldier (if e-mail on file)

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
            + "\n\n\n\n To Unsubscribe from A-MAP E-mail Notifications, please visit A-MAP (https://apps.dse.futures.army.mil/amap/) and click on User Profile -> Notification Settings"
        )

        send_mail(
            "[A-MAP] - " + self.notification.short_display(),
            email_body,
            "usarmy.a-map@army.mil",
            [self.soldier.dod_email],
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
    Defines a notification regarding a SoldierTransferRequest being created
    """

    transfer_request = models.ForeignKey(
        SoldierTransferRequest, on_delete=models.CASCADE, db_column="transfer_request_id"
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
    Defines a notification for a soldier regarding the status of one of their UserRequests or TransferRequests
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
    Defines a notification for a soldier regarding the creation of a SoldierTransferRequest
    """

    release_version = models.CharField("Release Version Number", max_length=15)
    release_notes = models.TextField("Release Notes", max_length=1024)
    release_url = models.TextField("Release Notes Teams URL", max_length=512)

    class Meta:
        db_table = "notifications_version_release"

    def __str__(self):
        return "A-MAP {} Release Notification".format(self.release_version)

    def short_display(self):
        return "A-MAP Version {}".format(self.release_version)

    def verbose_display(self):
        return self.release_notes


class AnnouncementNotification(Notification):
    """
    Defines a notification for an Announcement for A-MAP Users
    """

    title = models.CharField("Announcement Title", max_length=32)
    announcement = models.TextField("Annoucement", max_length=1024)
    announcement_url = models.TextField("Announcement Teams URL", max_length=512)

    class Meta:
        db_table = "notifications_announcement"

    def __str__(self):
        return "A-MAP Announcement: {}".format(self.title)

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
        return "A-MAP: {}".format(self.bugfix)

    def short_display(self):
        return self.bugfix

    def verbose_display(self):
        return self.bugfix_details
