from django.urls import path

from forms.views import (
    AwardType_NO_ID_RequestHandler,
    EvaluationType_NO_ID_RequestHandler,
    EventType_NO_ID_RequestHandler,
    TCSLocation_NO_ID_RequestHandler,
    TrainingType_NO_ID_RequestHandler,
    add_supporting_document,
    delete_supporting_document,
    get_all_supporting_document_types,
    get_designation_supporting_docs,
    get_unit_tracker_data,
    read_da_4856_document,
    read_supporting_document,
    shiny_add_4856,
    shiny_add_7817,
    shiny_amap_packet,
    shiny_delete_4856,
    shiny_delete_7817,
    shiny_edit_7817,
    shiny_export_7817_xml,
    shiny_get_event_associated_data,
    shiny_get_event_occurrences,
    shiny_ingest_7817_xml,
    shiny_update_4856,
    update_supporting_document,
)

urlpatterns = [
    # 4856 Views
    path("add/4856/<str:soldier_id>/<str:form_title>/<str:event_id>/<str:date>", shiny_add_4856, name="shiny_add_4856"),
    path("read/4856/<str:form_ids>", read_da_4856_document, name="read_da_4856_document"),
    path("edit/4856/<int:da_4856_id>", shiny_update_4856, name="shiny_update_da_4856"),
    path("delete/4856/<int:da_4856_id>", shiny_delete_4856, name="shiny_delete_da_4856"),
    # 7817 Views
    path("ingest/xml/<str:dod_id>", shiny_ingest_7817_xml, name="shiny_ingest_7817_xml"),
    path("export/xml/<str:dod_id>", shiny_export_7817_xml, name="shiny_export_7817_xml"),
    path("add/7817/<str:dod_id>", shiny_add_7817, name="shiny_add_7817"),
    path("edit/7817/<int:event_id>", shiny_edit_7817, name="shiny_edit_7817"),
    path("delete/7817/<int:event_id>", shiny_delete_7817, name="shiny_delete_7817"),
    path("7817/associated_documents/<int:event_id>", shiny_get_event_associated_data, name="shiny_event_assoc_docs"),
    # Supporting Document Views
    path(
        "designation_supporting_docs/<int:designation_id>",
        get_designation_supporting_docs,
        name="designation_supporting_docs",
    ),
    path(
        "add/supporting_document/<str:soldier_id>/<str:document_title>/<str:document_type>/<str:document_date>/<str:event_id>/<str:soldier_designation_id>",
        add_supporting_document,
        name="add_supporting_document",
    ),
    path(
        "read/supporting_document/<str:supporting_doc_ids>",
        read_supporting_document,
        name="read_supporting_document",
    ),
    path(
        "edit/supporting_document/<str:supporting_doc_id>",
        update_supporting_document,
        name="update_supporting_document",
    ),
    path(
        "delete/supporting_document/<str:supporting_doc_id>",
        delete_supporting_document,
        name="delete_supporting_document",
    ),
    # Supporting Document Type Views
    path("supporting_document_types", get_all_supporting_document_types, name="get_all_supporting_document_types"),
    # Unit Tracker Data
    path("training_and_evals", get_unit_tracker_data, name="get_train_and_eval_tracking_data"),
    path("event_occurrences", shiny_get_event_occurrences, name="get_event_occurrences"),
    # AMAP Packet
    path("amap_packet", shiny_amap_packet, name="shiny_amap_packet"),
    # Event Type
    path("event_type", EventType_NO_ID_RequestHandler.as_view(), name="event_type"),
    # Evaluation Type
    path("evaluation_type", EvaluationType_NO_ID_RequestHandler.as_view(), name="evaluation_type"),
    # Training Type
    path("training_type", TrainingType_NO_ID_RequestHandler.as_view(), name="training_type"),
    # Award Type
    path("award_type", AwardType_NO_ID_RequestHandler.as_view(), name="award_type"),
    # TCS Location
    path("tcs_location", TCSLocation_NO_ID_RequestHandler.as_view(), name="tcs_location"),
]
