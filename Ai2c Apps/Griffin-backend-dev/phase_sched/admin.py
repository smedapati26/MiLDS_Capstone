from django.contrib import admin

from .models import *


class PlannedPhaseAdmin(admin.ModelAdmin):
    pass


class PhaseLaneAdmin(admin.ModelAdmin):
    list_filter = ["unit"]
    search_fields = ["name"]


class PhaseEditLogAdmin(admin.ModelAdmin):
    pass


admin.site.register(PlannedPhase, PlannedPhaseAdmin)
admin.site.register(PhaseLane, PhaseLaneAdmin)
admin.site.register(PhaseEditLog, PhaseEditLogAdmin)
