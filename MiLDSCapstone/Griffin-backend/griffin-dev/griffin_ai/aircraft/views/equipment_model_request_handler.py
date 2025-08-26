from django.http import HttpRequest
from django.views import View

from .equipment_model import (
    read_equipment_model,
    update_equipment_model,
    delete_equipment_model,
    create_equipment_model,
    list_equipment_model,
)


class EquipmentModel_ID_RequestHandler(View):
    def get(self, request: HttpRequest, id: str):
        return read_equipment_model(request, id)

    def put(self, request: HttpRequest, id: str):
        return update_equipment_model(request, id)

    def delete(self, request: HttpRequest, id: str):
        return delete_equipment_model(request, id)


class EquipmentModel_NO_ID_RequestHandler(View):
    def post(self, request):
        return create_equipment_model(request)

    def get(self, request):
        return list_equipment_model(request)
