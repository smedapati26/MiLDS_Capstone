from django.contrib import admin

from .models import (
    Location,
    Login,
    ObjectTransferLog,
    ObjectTransferRequest,
    TaskForce,
    Unit,
    UnitPhaseOrder,
    User,
    UserRequest,
    UserRole,
    UserSetting,
)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("uic", "display_name", "echelon")
    list_filter = ["echelon"]
    search_fields = ["uic", "short_name", "display_name"]


@admin.register(TaskForce)
class TaskForceAdmin(admin.ModelAdmin):
    pass


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass


@admin.register(Login)
class LoginAdmin(admin.ModelAdmin):
    pass


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(UserSetting)
class UserSettingAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(UserRequest)
class UserRequestAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(UnitPhaseOrder)
class UnitPhaseOrderAdmin(admin.ModelAdmin):
    pass


@admin.register(ObjectTransferRequest)
class ObjectTransferRequestAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(ObjectTransferLog)
class ObjectTransferLogAdmin(admin.ModelAdmin):
    exclude = ["id"]
