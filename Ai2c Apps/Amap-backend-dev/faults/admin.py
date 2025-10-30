from django.contrib import admin

from .models import *


class FaultAdmin(admin.ModelAdmin):
    exclude = ["id"]


class FaultActionAdmin(admin.ModelAdmin):
    exclude = ["id"]


class MaintainerFaultActionAdmin(admin.ModelAdmin):
    exclude = ["id"]


admin.site.register(Fault, FaultAdmin)
admin.site.register(FaultAction, FaultActionAdmin)
admin.site.register(MaintainerFaultAction, MaintainerFaultActionAdmin)
