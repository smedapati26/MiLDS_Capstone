from django.urls import path

from fhp.views import (
    get_unit_monthly_projections,
    get_unit_monthly_predictions,
    transform_projections,
    ingest_fy_predictions,
)

urlpatterns = [
    # CRUD
    path("monthly_projections/<str:uic>", get_unit_monthly_projections, name="fhp_unit_monthly_projections"),
    path("monthly_predictions/<str:uic>", get_unit_monthly_predictions, name="fhp_unit_monthly_predictions"),
    # Transforms
    path("transform/monthly_projections", transform_projections, name="transform_monthly_projections"),
    # Ingestion
    path("ingest/fy_monthly_predictions", ingest_fy_predictions, name="ingest_fy_monthly"),
]
