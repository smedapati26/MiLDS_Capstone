from django.contrib import admin

from reports.models import DailyStatusReport


class DailyStatusReportAdmin(admin.ModelAdmin):
    exclude = ["id"]


admin.site.register(DailyStatusReport, DailyStatusReportAdmin)
