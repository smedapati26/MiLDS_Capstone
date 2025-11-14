from django.contrib import admin
from .models import (
    Aircraft, Soldier,
    Scenario, ScenarioEvent,
    ScenarioRun, ScenarioRunLog
)

# ---------- Aircraft ----------
@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display  = ("aircraft_pk", "model_name", "status", "rtl", "current_unit", "last_update_time")
    list_filter   = ("model_name", "status", "rtl", "current_unit")
    search_fields = ("aircraft_pk", "model_name", "remarks")
    ordering      = ("aircraft_pk",)
    readonly_fields = ("last_sync_time", "last_export_upload_time", "last_update_time")

# ---------- Soldier ----------
@admin.register(Soldier)
class SoldierAdmin(admin.ModelAdmin):
    list_display  = ("user_id", "rank", "last_name", "first_name", "primary_mos", "current_unit", "is_maintainer")
    list_filter   = ("rank", "primary_mos", "current_unit", "is_maintainer")
    search_fields = ("user_id", "last_name", "first_name")
    ordering      = ("last_name", "first_name")

# ---------- Scenarios & Events ----------
class ScenarioEventInline(admin.TabularInline):
    model = ScenarioEvent
    extra = 0
    autocomplete_fields = ("aircraft",)
    fields = ("aircraft", "status", "rtl", "date_down", "remarks")
    show_change_link = True

@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display  = ("name", "created_at", "event_count")
    search_fields = ("name", "description")
    inlines       = [ScenarioEventInline]

    def event_count(self, obj):
        return obj.events.count()
    event_count.short_description = "Events"

@admin.register(ScenarioEvent)
class ScenarioEventAdmin(admin.ModelAdmin):
    list_display  = ("scenario", "aircraft", "status", "rtl", "date_down", "short_remarks")
    list_filter   = ("status", "rtl", "scenario")
    search_fields = ("scenario__name", "aircraft__aircraft_pk", "remarks")
    autocomplete_fields = ("aircraft",)

    def short_remarks(self, obj):
        return (obj.remarks or "")[:60]
    short_remarks.short_description = "Remarks"

# ---------- Runs & Logs (read-only) ----------
class ScenarioRunLogInline(admin.TabularInline):
    model = ScenarioRunLog
    extra = 0
    can_delete = False
    readonly_fields = ("aircraft_pk", "message", "before", "after", "created_at")
    fields = ("aircraft_pk", "message", "created_at")

@admin.register(ScenarioRun)
class ScenarioRunAdmin(admin.ModelAdmin):
    list_display  = ("id", "scenario", "started_at", "applied_events", "total_events")
    list_filter   = ("scenario", "started_at")
    search_fields = ("scenario__name",)
    readonly_fields = ("scenario", "started_at", "applied_events", "total_events")
    inlines = [ScenarioRunLogInline]

@admin.register(ScenarioRunLog)
class ScenarioRunLogAdmin(admin.ModelAdmin):
    list_display  = ("run", "aircraft_pk", "created_at", "message")
    list_filter   = ("created_at",)
    search_fields = ("run__scenario__name", "aircraft_pk", "message")
    readonly_fields = ("run", "aircraft_pk", "message", "before", "after", "created_at")
    ordering = ("-created_at",)
