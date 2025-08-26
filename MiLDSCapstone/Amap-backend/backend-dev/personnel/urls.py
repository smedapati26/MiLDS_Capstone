from django.urls import path
from personnel.views import (
    UserRequestViews,
    UserRoleViews,
    UserViews,
    get_all_elevated_roles,
    record_login,
    shiny_get_all_units,
    shiny_get_soldier_da_4856s,
    shiny_get_soldier_da_7817s,
    shiny_get_soldier_task_completion,
    shiny_get_all_soldiers,
    shiny_get_unit_soldiers,
    shiny_get_unit_roster,
    shiny_get_unit_summary,
    shiny_export_unit_summary,
    shiny_import_soldier_info,
    shiny_update_soldier_info,
    shiny_get_transfer_requests,
    shiny_create_transfer_request,
    shiny_adjudicate_transfer_request,
    shiny_get_soldier_supporting_documents,
    shiny_create_soldier_flag,
    shiny_get_soldier_flags,
    shiny_update_soldier_flag,
    shiny_delete_soldier_flag,
    MOSCode_NO_ID_RequestHandler,
)

app_name = "personnel"

urlpatterns = [
    # Unit Related Views
    path("units/all", shiny_get_all_units, name="shiny_get_all_units"),
    path("units/soldiers/<str:uic>/<str:type>", shiny_get_unit_soldiers, name="shiny_get_unit_soldiers"),
    path("units/roster/<str:uic>/<str:type>", shiny_get_unit_roster, name="shiny_get_unit_roster"),
    path(
        "units/summary/<str:uic>/<str:expand>/<str:summarize_by>",
        shiny_get_unit_summary,
        name="shiny_get_unit_summary",
    ),
    path(
        "units/summary/export/<str:uic>/<str:expand>/<str:summarize_by>/<str:full_report>",
        shiny_export_unit_summary,
        name="shiny_export_unit_summary",
    ),
    # Soldier Related Views
    path("soldiers/all", shiny_get_all_soldiers, name="shiny_get_all_soldiers"),
    path("soldiers/import-info/<str:user_id>", shiny_import_soldier_info, name="import_soldier_info"),
    path("soldiers/update-info/<str:user_id>", shiny_update_soldier_info, name="update_soldier_info"),
    path(
        "soldiers/get-completed-tasks/<str:user_id>",
        shiny_get_soldier_task_completion,
        name="shiny_get_soldier_task_completion",
    ),
    # Soldier Form Views
    path("soldiers/get7817s/<str:user_id>", shiny_get_soldier_da_7817s, name="shiny_get_soldier_da_7817s"),
    path("soldiers/get4856s/<str:user_id>", shiny_get_soldier_da_4856s, name="shiny_get_soldier_da_4856s"),
    path(
        "soldiers/get-supporting-documents/<str:user_id>",
        shiny_get_soldier_supporting_documents,
        name="shiny_get_soldier_supporting_documents",
    ),
    # Soldier Transfer Views
    path("transfer/get/<str:get_type>", shiny_get_transfer_requests, name="shiny_get_transfer_requests"),
    path("transfer/create", shiny_create_transfer_request, name="shiny_create_transfer_request"),
    path("transfer/adjudicate", shiny_adjudicate_transfer_request, name="shiny_adjudicate_transfer_request"),
    # Soldier Flag Views
    path("flags/create", shiny_create_soldier_flag, name="shiny_create_soldier_flag"),
    path("flags/get/<str:specific_soldier>", shiny_get_soldier_flags, name="shiny_get_soldier_flags"),
    path("flags/update", shiny_update_soldier_flag, name="shiny_update_soldier_flag"),
    path("flags/delete/<int:flag_id>", shiny_delete_soldier_flag, name="shiny_delete_soldier_flag"),
    # User Permissions Related Views
    path("user/access_requests", UserRequestViews.as_view(), name="shiny_user_requests"),
    path("user/roles/all_elevated", get_all_elevated_roles, name="shiny_get_all_elevated_roles"),
    path("record_login/<str:user_id>", record_login, name="record_login"),
    path("user/roles/<str:user_id>", UserRoleViews.as_view(), name="shiny_user_roles"),
    path("user/<str:user_id>", UserViews.as_view(), name="shiny_user"),
    # MOSCode Views
    path("mos_code/<str:type>", MOSCode_NO_ID_RequestHandler.as_view(), name="mos_code"),
]
