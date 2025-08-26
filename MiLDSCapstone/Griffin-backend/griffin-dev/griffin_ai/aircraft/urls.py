from django.urls import path

from aircraft.views import (
    get_aircraft_serial_numbers,
    get_raw_1352,
    get_1352,
    mass_aircraft_updates,
    update_aircraft,
    add_aircraft_to_taskforce,
    remove_aircraft_from_taskforce,
    transform_aircraft,
    shiny_aircraft_dsr,
    create_message,
    read_message,
    update_message,
    delete_message,
    create_equipment,
    read_equipment,
    update_equipment,
    delete_equipment,
    create_modification,
    read_modification,
    update_modification,
    delete_modification,
    create_modification_category,
    read_modification_category,
    update_modification_category,
    delete_modification_category,
    create_applied_modification,
    read_applied_modification,
    update_applied_modification,
    delete_applied_modification,
    get_modification_system,
    get_modification_categories,
    get_all_modifications,
    get_unit_equipment,
    get_all_messages,
    create_message_compliance,
    read_message_compliance,
    update_message_compliance,
    delete_message_compliance,
    get_unit_messages,
    get_unit_message_compliances,
    get_message_system,
    transform_flights,
    transform_1352s,
    list_flights,
    EquipmentModel_ID_RequestHandler,
    EquipmentModel_NO_ID_RequestHandler,
    get_flights_day_night_and_mission_data,
   
)

urlpatterns = [
    # DSR Endpoints
    path("shiny/dsr/<str:uic>", shiny_aircraft_dsr, name="shiny_aircraft_dsr"),
    # Data Transformation Endpoints
    path("transform/aircraft", transform_aircraft, name="transform_aircraft"),
    path("transform/flights", transform_flights, name="transform_flights"),
    path("transform/1352", transform_1352s, name="transform_1352s"),
    # Aircraft Editing Endpoints
    path("update/<str:aircraft_serial>", update_aircraft, name="update_aircraft"),
    path("mass_updates", mass_aircraft_updates, name="mass_aircraft_updates"),
    # Task Force Assignment Endpoints
    path(
        "add_to_taskforce/<str:tf_uic>",
        add_aircraft_to_taskforce,
        name="add_aircraft_to_taskforce",
    ),
    path(
        "remove_from_taskforce/<str:tf_uic>",
        remove_aircraft_from_taskforce,
        name="remove_aircraft_from_taskforce",
    ),
    # 1352 Endpoints
    path("get_raw_1352/<str:uic>", get_raw_1352, name="get_raw_1352"),
    path(
        "get_raw_1352/<str:uic>/<str:start_date>/<str:end_date>",
        get_raw_1352,
        name="get_raw_1352",
    ),
    path("get_1352/<str:uic>", get_1352, name="get_1352"),
    path(
        "get_1352/<str:uic>/<str:start_date>/<str:end_date>",
        get_1352,
        name="get_1352",
    ),
    # Aircraft
    path("get_aircraft/<str:uic>", get_aircraft_serial_numbers, name="get_aircraft"),
    # Aircraft Message Endpoints
    path("message/create/<str:message_number>", create_message, name="create_aircraft_message"),
    path("message/read/<str:message_number>", read_message, name="read_aircraft_message"),
    path("message/update/<str:message_number>", update_message, name="update_aircraft_message"),
    path("message/delete/<str:message_number>", delete_message, name="delete_aircraft_message"),
    path("message/all", get_all_messages, name="get_all_messages"),
    path("message/unit/<str:unit_uic>", get_unit_messages, name="get_unit_messages"),
    path("message/system/<str:unit_uic>", get_message_system, name="get_message_system"),
    # Aircraft Message Compliance Endpoints
    path("message/compliance/create", create_message_compliance, name="create_message_compliance"),
    path("message/compliance/read/<int:message_id>", read_message_compliance, name="read_message_compliance"),
    path("message/compliance/update/<int:message_id>", update_message_compliance, name="update_message_compliance"),
    path("message/compliance/delete/<int:message_id>", delete_message_compliance, name="delete_message_compliance"),
    path("message/compliance/unit/<str:unit_uic>", get_unit_message_compliances, name="get_unit_message_compliances"),
    # Equipment Endpoints
    path("equipment/create", create_equipment, name="create_equipment"),
    path("equipment/read/<int:equipment_id>", read_equipment, name="read_equipment"),
    path("equipment/update/<int:equipment_id>", update_equipment, name="update_equipment"),
    path("equipment/delete/<int:equipment_id>", delete_equipment, name="delete_equipment"),
    path("equipment/unit/<str:unit_uic>", get_unit_equipment, name="get_unit_equipment"),
    # Modification Endpoints
    path("modification/create/<str:name>", create_modification, name="create_modification"),
    path("modification/read/<str:name>", read_modification, name="read_modification"),
    path("modification/update/<str:name>", update_modification, name="update_modification"),
    path("modification/delete/<str:name>", delete_modification, name="delete_modification"),
    # Modification Category Endpoints
    path("modification/category/create/<str:name>", create_modification_category, name="create_modification_category"),
    path(
        "modification/category/read/<str:name>/<str:value>",
        read_modification_category,
        name="read_modification_category",
    ),
    path("modification/category/update/<str:name>", update_modification_category, name="update_modification_category"),
    path(
        "modification/category/delete/<str:name>/<str:value>",
        delete_modification_category,
        name="delete_modification_category",
    ),
    path(
        "modification/category/categories/<str:name>", get_modification_categories, name="get_modification_categories"
    ),
    path("modification/all", get_all_modifications, name="get_all_modifications"),
    # Applied Modification Endpoints
    path("applied_modification/create/<str:name>", create_applied_modification, name="create_applied_modification"),
    path(
        "applied_modification/read/<str:name>/<str:aircraft_serial>",
        read_applied_modification,
        name="read_applied_modification",
    ),
    path("applied_modification/update/<str:name>", update_applied_modification, name="update_applied_modification"),
    path(
        "applied_modification/delete/<str:name>/<str:aircraft_serial>",
        delete_applied_modification,
        name="delete_applied_modification",
    ),
    path("applied_modification/system/<str:unit_uic>", get_modification_system, name="get_modification_system"),
    # Flights
    path("flights", list_flights, name="list_flights"),
    path(
        "flights/day_night_mission/<str:unit_uic>",
        get_flights_day_night_and_mission_data,
        name="get_flights_day_night_and_mission_data",
    ),
    # Equipment Model
    path("equipment_model/<str:id>", EquipmentModel_ID_RequestHandler.as_view(), name="equipment_model-id"),
    path("equipment_model", EquipmentModel_NO_ID_RequestHandler.as_view(), name="equipment_model-no-id"),
    # MILDS additions 
    #path("aircraft_for_milds/<str:uic>", aircraft_for_milds, name="aircraft_for_milds"),



]
