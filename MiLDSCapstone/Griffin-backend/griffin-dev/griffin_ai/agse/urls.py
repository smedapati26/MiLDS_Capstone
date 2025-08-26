from django.urls import path
from agse.views import (
    transform_agse,
    shiny_get_agse,
    shiny_edit_agse,
    remove_agse_from_taskforce,
    add_agse_to_taskforce,
)

urlpatterns = [
    path("vantage_agse_update", transform_agse, name="transform_agse"),
    path("shiny/get_agse/<str:uic>", shiny_get_agse, name="shiny_get_agse"),
    path("edit/<str:equip_num>", shiny_edit_agse, name="shiny_edit_agse"),
    path(
        "remove_from_taskforce/<str:tf_uic>",
        remove_agse_from_taskforce,
        name="remove_agse_from_taskforce",
    ),
    path(
        "add_to_taskforce/<str:tf_uic>",
        add_agse_to_taskforce,
        name="add_agse_to_taskforce",
    ),
]
