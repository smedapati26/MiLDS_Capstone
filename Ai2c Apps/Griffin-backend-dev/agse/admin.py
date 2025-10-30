from django.contrib import admin

from .models import AGSE, AgseEdits, UnitAGSE


class AgseAdmin(admin.ModelAdmin):
    pass


class UnitAgseAdmin(admin.ModelAdmin):
    exclude = ["id"]


class AgseEditsAdmin(admin.ModelAdmin):
    pass


admin.site.register(AGSE, AgseAdmin)
admin.site.register(UnitAGSE, UnitAgseAdmin)
admin.site.register(AgseEdits, AgseEditsAdmin)
