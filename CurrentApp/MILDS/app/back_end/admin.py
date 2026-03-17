from django.contrib import admin
from .models import (
    Aircraft, Soldier,
    Scenario, ScenarioEvent,
    ScenarioRun, ScenarioRunLog
)
from app.api.griffin_client import GriffinClient

# ---------- Aircraft ----------
@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display  = ("serial", "model_name", "status", "rtl", "current_unit", "last_update_time")
    list_filter   = ("model_name", "status", "rtl", "current_unit")
    search_fields = ("serial", "model_name", "remarks")
    ordering      = ("serial",)
    readonly_fields = ("last_sync_time", "last_export_upload_time", "last_update_time")

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        # Push to Griffin after saving
        try:
            client = GriffinClient()

            payload = {
                "status": obj.status,
                "rtl": obj.rtl,
                "current_unit": obj.current_unit,
                "hours_to_phase": obj.hours_to_phase,
                "remarks": obj.remarks,
                "date_down": obj.date_down.isoformat() if obj.date_down else None,
            }

            result = client.inject_aircraft_update(obj.serial, payload)

            print("ADMIN → GRIFFIN RESULT:", result)

        except Exception as e:
            print("ADMIN → GRIFFIN FAILED:", e)

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
    search_fields = ("scenario__name", "aircraft__serial", "remarks")
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
    search_fields = ("run__scenario__name", "aircraft_pk", "message")
    readonly_fields = ("run", "aircraft_pk", "message", "before", "after", "created_at")
    list_filter   = ("created_at",)
    ordering = ("-created_at",)
