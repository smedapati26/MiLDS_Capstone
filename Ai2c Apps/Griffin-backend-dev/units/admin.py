from django.contrib import admin

from units.models import Unit


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("uic", "display_name", "echelon", "compo", "state")
    list_filter = ["compo", "echelon"]
    search_fields = ["uic", "short_name", "display_name"]
