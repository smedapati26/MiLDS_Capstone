from django.urls import path
from uas.views import (
    shiny_uas_dsr,
    shiny_uas_status_calculations,
    transform_uac,
    transform_uav,
    create_uac,
    read_uac,
    update_uac,
    delete_uac,
    create_uav,
    read_uav,
    update_uav,
    delete_uav,
    transform_uas_flights,
)


urlpatterns = [
    path("shiny/dsr/<str:uic>", shiny_uas_dsr),
    path("shiny/dsr/status/<str:uic>", shiny_uas_status_calculations, name="uas_system"),
    path("transform/uac", transform_uac),
    path("transform/uav", transform_uav),
    # UAV Endpoints
    path("uav/create", create_uav, name="create_uav"),
    path("uav/read/<int:uav_id>", read_uav, name="read_uav"),
    path("uav/update/<int:uav_id>", update_uav, name="update_uav"),
    path("uav/delete/<int:uav_id>", delete_uav, name="delete_uav"),
    # UAC Endpoints
    path("uac/create", create_uac, name="create_uac"),
    path("uac/read/<int:uac_id>", read_uac, name="read_uac"),
    path("uac/update/<int:uac_id>", update_uac, name="update_uac"),
    path("uac/delete/<int:uac_id>", delete_uac, name="delete_uac"),
    # UAS Flight Endpoints
    path("transform/uas_flight", transform_uas_flights),
]
