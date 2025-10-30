from django.contrib import admin

from consistency.models import LogicalClock


@admin.register(LogicalClock)
class LogicalClockAdmin(admin.ModelAdmin):
    pass
