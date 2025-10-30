from django.urls import path

from reports.views import (
    create_csv_dsr_export_html,
    create_dsr_export_html,
)

urlpatterns = [
    path("dsr/html/create/<str:uic>", create_dsr_export_html, name="create_dsr_export_html"),
    path("dsr/html/csv/<str:uic>", create_csv_dsr_export_html, name="create_csv_dsr_export_html"),
]
