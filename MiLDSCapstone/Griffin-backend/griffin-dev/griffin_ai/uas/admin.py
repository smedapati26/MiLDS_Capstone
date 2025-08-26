from django.contrib import admin

from .models import UAC, UAV, UnitUAV, UnitUAC, Flight


class UACAdmin(admin.ModelAdmin):
    exclude = ["id"]


class UAVAdmin(admin.ModelAdmin):
    exclude = ["id"]


class UnitUACAdmin(admin.ModelAdmin):
    exclude = ["id"]


class UnitUAVAdmin(admin.ModelAdmin):
    exclude = ["id"]


class FlightAdmin(admin.ModelAdmin):
    exclude = ["id"]


admin.site.register(UAC, UACAdmin)
admin.site.register(UAV, UAVAdmin)
admin.site.register(UnitUAC, UnitUACAdmin)
admin.site.register(UnitUAV, UnitUAVAdmin)
admin.site.register(Flight, FlightAdmin)
