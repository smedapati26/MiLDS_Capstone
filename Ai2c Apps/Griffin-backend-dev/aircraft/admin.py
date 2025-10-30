from django.contrib import admin

from .models import (
    DA_1352,
    Aircraft,
    AircraftEditLog,
    AppliedModification,
    Equipment,
    EquipmentModel,
    Fault,
    Flight,
    Inspection,
    InspectionReference,
    Message,
    MessageCompliance,
    Modification,
    ModificationCategory,
    Phase,
    Raw_DA_1352,
    UnitAircraft,
    UnitEquipment,
    UserAircraftRemark,
)


@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display = ("serial", "model", "current_unit")
    list_filter = ["model"]
    search_fields = ["serial"]


@admin.register(UnitAircraft)
class UnitAircraftAdmin(admin.ModelAdmin):
    exclude = ["id"]
    search_fields = ["current_unit", "serial"]


@admin.register(AircraftEditLog)
class AircraftEditLogAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(UserAircraftRemark)
class UserAircraftRemarkAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(Inspection)
class InspectionAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(InspectionReference)
class InspectionReferenceAdmin(admin.ModelAdmin):
    exclude = ["id"]
    list_display = ["code", "model"]
    list_filter = ["model"]
    search_fields = ["code"]


@admin.register(Phase)
class PhaseAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(Fault)
class FaultAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(Raw_DA_1352)
class RawDA1352Admin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(DA_1352)
class DA1352Admin(admin.ModelAdmin):
    exclude = ["id"]
    list_display = ["serial_number", "reporting_month", "model_name"]
    list_filter = ["model_name", "source"]
    search_fields = ["serial_number", "reporting_uic", "reporting_month", "model_name"]


@admin.register(EquipmentModel)
class EquipmentModelAdmin(admin.ModelAdmin):
    exclude = ["id"]
    list_display = ["name"]


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    exclude = ["id"]
    list_display = ["model", "serial_number", "current_unit"]
    list_filter = ["model"]
    search_fields = ["model", "serial_number", "current_unit"]


@admin.register(UnitEquipment)
class UnitEquipmentAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(Modification)
class ModificationAdmin(admin.ModelAdmin):
    pass


@admin.register(ModificationCategory)
class ModificationCategoryAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(AppliedModification)
class AppliedModificationAdmin(admin.ModelAdmin):
    exclude = ["id"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    pass


@admin.register(MessageCompliance)
class MessageComplianceAdmin(admin.ModelAdmin):
    exclude = ["id"]
