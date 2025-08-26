from django.urls import path
from supply.views import add_parts_order, delete_parts_on_order, update_parts_order, list_parts_on_order

urlpatterns = [
    path("add_parts_order/<str:dod_document_number>", add_parts_order, name="add_parts_order"),
    path("list_parts_on_order/<str:uic>", list_parts_on_order, name="list_parts_on_order"),
    path("delete_parts_on_order/<str:dod_document_number>", delete_parts_on_order, name="delete_parts_on_order"),
    path("update_parts_order/<str:dod_document_number>", update_parts_order, name="update_parts_order"),
]
