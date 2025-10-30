from django.contrib import admin

from personnel.models import Soldier

from .models import *


def send_notification_to_all(modeladmin, request, queryset):
    for notification in queryset:
        notification.send_notification_to_all()


def send_notification_to_all_admins(modeladmin, request, queryset):
    for notification in queryset:
        notification.send_notification_to_all_admins()


def send_notification_to_all_recorders(modeladmin, request, queryset):
    for notification in queryset:
        notification.send_notification_to_all_recorders()


class NotificationAdmin(admin.ModelAdmin):
    exclude = ["id"]


class SoldierNotificationAdmin(admin.ModelAdmin):
    exclude = ["id"]


class TransferRequestNotificationAdmin(admin.ModelAdmin):
    exclude = []


class AccessRequestNotificationAdmin(admin.ModelAdmin):
    exclude = []


class ApprovedDeniedNotificationAdmin(admin.ModelAdmin):
    exclude = []


class ReleaseNotificationAdmin(admin.ModelAdmin):
    exclude = []
    actions = [send_notification_to_all, send_notification_to_all_admins, send_notification_to_all_recorders]


class AnnouncementNotificationAdmin(admin.ModelAdmin):
    exclude = []
    actions = [send_notification_to_all, send_notification_to_all_admins, send_notification_to_all_recorders]


class BugfixNotificationAdmin(admin.ModelAdmin):
    exclude = []
    actions = [send_notification_to_all, send_notification_to_all_admins, send_notification_to_all_recorders]


admin.site.register(Notification, NotificationAdmin)
admin.site.register(SoldierNotification, SoldierNotificationAdmin)
admin.site.register(TransferRequestNotification, TransferRequestNotificationAdmin)
admin.site.register(AccessRequestNotification, AccessRequestNotificationAdmin)
admin.site.register(ApprovedDeniedNotification, ApprovedDeniedNotificationAdmin)
admin.site.register(ReleaseNotification, ReleaseNotificationAdmin)
admin.site.register(AnnouncementNotification, AnnouncementNotificationAdmin)
admin.site.register(BugfixNotification, BugfixNotificationAdmin)
