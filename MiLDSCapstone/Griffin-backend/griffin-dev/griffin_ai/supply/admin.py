from django.contrib import admin

from supply.models import PartsOrder


class SupplyAdmin(admin.ModelAdmin):
    pass


admin.site.register(PartsOrder, SupplyAdmin)
