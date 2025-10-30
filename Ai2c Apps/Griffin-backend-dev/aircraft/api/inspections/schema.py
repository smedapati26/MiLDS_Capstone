from ninja import ModelSchema

from aircraft.models import InspectionReference


class InspectionReferenceOut(ModelSchema):
    class Meta:
        model = InspectionReference
        fields = ["id", "code", "model", "common_name", "tracking_type", "is_phase"]
