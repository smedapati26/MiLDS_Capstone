from typing import List

from django.http import HttpRequest
from ninja import Router
from ninja.pagination import paginate

from aircraft.api.inspections.schema import InspectionReferenceOut
from aircraft.models import InspectionReference

inspection_router = Router()


######## INSPECTION REFERENCES ########
@inspection_router.get(
    "/inspection-types", response=List[InspectionReferenceOut], summary="Aircraft Model Inspection Types List"
)
def list_inspection_references(request: HttpRequest, model: str):
    """
    Return a list of all possible inspections for an aircraft model

    """
    return InspectionReference.objects.filter(model=model)
