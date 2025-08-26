from django.contrib import admin
from fhp.models import RawAnnualProjection, RawMonthlyForecast, RawCostFactor, MonthlyProjection, MonthlyPrediction


class RawAnnualAdmin(admin.ModelAdmin):
    exclude = ["id"]


class RawMonthlyForecastAdmin(admin.ModelAdmin):
    exclude = ["id"]


class RawCostFactorAdmin(admin.ModelAdmin):
    exclude = ["id"]


class MonthlyProjectionAdmin(admin.ModelAdmin):
    exclude = ["id"]


class MonthlyPredictionAdmin(admin.ModelAdmin):
    exclude = ["id"]


admin.site.register(RawAnnualProjection, RawAnnualAdmin)
admin.site.register(RawMonthlyForecast, RawMonthlyForecastAdmin)
admin.site.register(RawCostFactor, RawCostFactorAdmin)
admin.site.register(MonthlyProjection, MonthlyPredictionAdmin)
admin.site.register(MonthlyPrediction, MonthlyPredictionAdmin)
