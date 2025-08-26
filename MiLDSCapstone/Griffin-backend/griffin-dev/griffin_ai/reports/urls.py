from django.urls import path

from reports.views import create_dsr_export, create_csv_dsr_export, dsr_export_page


urlpatterns = [
    path("dsr/create/<str:uic>", create_dsr_export, name="create_dsr_export"),
    path("dsr/csv/<str:uic>", create_csv_dsr_export, name="create_csv_dsr_export"),
    path("dsr/export_dsr_page", dsr_export_page),
]
