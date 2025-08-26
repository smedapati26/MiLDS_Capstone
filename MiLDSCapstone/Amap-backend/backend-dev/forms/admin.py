from django.contrib import admin

from .models import (
    DA_4856,
    DA_7817,
    EventTasks,
    APICallLogging,
    SupportingDocument,
    SupportingDocumentType,
    EventType,
    AwardType,
    EvaluationType,
    TrainingType,
)


class DA7817Admin(admin.ModelAdmin):
    exclude = ["id"]


class DA4856Admin(admin.ModelAdmin):
    exclude = ["id"]


class EventTaskAdmin(admin.ModelAdmin):
    exclude = ["id"]


class APICallLoggingAdmin(admin.ModelAdmin):
    exclude = ["id"]


class SupportingDocumentAdmin(admin.ModelAdmin):
    exclude = ["id"]


class SupportingDocumentTypeAdmin(admin.ModelAdmin):
    exclude = ["id"]


class EventTypeAdmin(admin.ModelAdmin):
    exclude = ["id"]


class EvaluationTypeAdmin(admin.ModelAdmin):
    exclude = ["id"]


class TrainingTypeAdmin(admin.ModelAdmin):
    exclude = ["id"]


class AwardTypeAdmin(admin.ModelAdmin):
    exclude = ["id"]


admin.site.register(DA_7817, DA7817Admin)
admin.site.register(DA_4856, DA4856Admin)
admin.site.register(EventTasks, EventTaskAdmin)
admin.site.register(APICallLogging, APICallLoggingAdmin)
admin.site.register(SupportingDocument, SupportingDocumentAdmin)
admin.site.register(SupportingDocumentType, SupportingDocumentTypeAdmin)
admin.site.register(EventType, EventTaskAdmin)
admin.site.register(EvaluationType, EvaluationTypeAdmin)
admin.site.register(TrainingType, TrainingTypeAdmin)
admin.site.register(AwardType, AwardTypeAdmin)
