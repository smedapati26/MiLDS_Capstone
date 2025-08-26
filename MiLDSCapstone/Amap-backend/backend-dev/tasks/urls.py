from django.urls import path
from tasks.views import (
    shiny_get_all_tasks,
    shiny_get_task_info,
    shiny_get_uctl_info,
    create_ctl,
    add_tasks_to_ictl,
    get_all_ictls,
    read_task_pdf,
    shiny_create_unit_task,
    get_uctl_tasks,
    shiny_get_searchable_tasklist,
    shiny_update_task_info,
    shiny_update_uctl_info,
    shiny_remove_task_from_uctl,
    shiny_delete_task,
    shiny_supercede_uctl,
    get_soldier_ctls,
)

app_name = "tasks"

urlpatterns = [
    path("get_all_tasks", shiny_get_all_tasks, name="shiny_get_all_tasks"),
    path("get_task_info/<str:task_number>", shiny_get_task_info, name="shiny_get_task_info"),
    path("update_task_info/<str:task_number>", shiny_update_task_info, name="shiny_update_task_info"),
    path("delete_task/<str:task_number>", shiny_delete_task, name="shiny_delete_task"),
    path("get_uctl_info/<int:uctl_id>", shiny_get_uctl_info, name="shiny_get_uctl_info"),
    path("update_uctl_info/<int:uctl_id>", shiny_update_uctl_info, name="shiny_update_uctl_info"),
    path("supercede_uctl/<int:uctl_id>", shiny_supercede_uctl, name="shiny_supercede_uctl"),
    path("get_uctl_tasks/<int:uctl_id>", get_uctl_tasks, name="get_uctl_tasks"),
    path("add_tasks_to_ictl", add_tasks_to_ictl, name="add_tasks_to_ictl"),
    path(
        "remove_task_from_uctl/<int:uctl_id>/<str:task_number>",
        shiny_remove_task_from_uctl,
        name="shiny_remove_task_from_uctl",
    ),
    path(
        "create_unit_task/<str:task_unit_uic>/<str:task_title>/<str:training_location>/<str:frequency>/<str:subject_area>",
        shiny_create_unit_task,
        name="shiny_create_unit_task",
    ),
    path("read/task/<str:task_number>", read_task_pdf, name="read_task_pdf"),
    path("create_ctl", create_ctl, name="create_ctl"),
    path("get_all_ictls", get_all_ictls, name="get_all_ictls"),
    path("get_searchable_tasklist/<str:action>", shiny_get_searchable_tasklist, name="get_searchable_unit_tasks"),
    path("get_soldier_ctls/<str:user_id>", get_soldier_ctls, name="get_soldier_ctls"),
]
