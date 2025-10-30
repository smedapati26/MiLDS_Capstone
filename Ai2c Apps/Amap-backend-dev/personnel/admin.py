from django.contrib import admin

from .models import *

# class UnitAdmin(admin.ModelAdmin):
#     pass


class SoldierAdmin(admin.ModelAdmin):
    search_fields = ["user_id"]


class UserRoleAdmin(admin.ModelAdmin):
    exclude = ["id"]


class UserRequestAdmin(admin.ModelAdmin):
    exclude = ["id"]


class SoldierTransferRequestAdmin(admin.ModelAdmin):
    exclude = ["id"]


class SoldierFlagAdmin(admin.ModelAdmin):
    exclude = ["id"]


class LoginAdmin(admin.ModelAdmin):
    exclude = ["id"]


class MOSCodeAdmin(admin.ModelAdmin):
    exclude = ["id"]


class SoldierAdditionalMOSAdmin(admin.ModelAdmin):
    exclude = ["id"]


class SoldierDesignationAdmin(admin.ModelAdmin):
    exclude = ["id"]


class DesignationAdmin(admin.ModelAdmin):
    exclude = ["id"]


class SkillAdmin(admin.ModelAdmin):
    exclude = ["id"]


# admin.site.register(Unit, UnitAdmin)
admin.site.register(Soldier, SoldierAdmin)
admin.site.register(UserRole, UserRequestAdmin)
admin.site.register(UserRequest, UserRequestAdmin)
admin.site.register(SoldierTransferRequest, SoldierTransferRequestAdmin)
admin.site.register(SoldierFlag, SoldierFlagAdmin)
admin.site.register(Login, LoginAdmin)
admin.site.register(MOSCode, MOSCodeAdmin)
admin.site.register(SoldierAdditionalMOS, SoldierAdditionalMOSAdmin)
admin.site.register(SoldierDesignation, SoldierDesignationAdmin)
admin.site.register(Designation, DesignationAdmin)
admin.site.register(Skill, SkillAdmin)
