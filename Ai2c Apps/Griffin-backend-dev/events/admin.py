from django.contrib import admin

from .models import DonsaEvent, Event, EventSeries, MaintenanceEvent, MaintenanceLane, MaintenanceRequest, TrainingEvent


@admin.register(DonsaEvent)
class DonsaEventAdmin(admin.ModelAdmin):
    pass


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    pass


@admin.register(EventSeries)
class EventSeriesAdmin(admin.ModelAdmin):
    pass


@admin.register(MaintenanceEvent)
class MaintenanceEventAdmin(admin.ModelAdmin):
    pass


@admin.register(MaintenanceLane)
class MaintenanceLaneAdmin(admin.ModelAdmin):
    pass


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    pass


@admin.register(TrainingEvent)
class TrainingEventAdmin(admin.ModelAdmin):
    pass
