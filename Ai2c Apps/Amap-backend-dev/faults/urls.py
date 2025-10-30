from django.urls import path

from faults.views import get_earliest_maintainer_fault, get_maintainer_faults, transform_faults

app_name = "faults"

urlpatterns = [
    # Maintainer Fault Views
    path(
        "maintainer/<str:user_id>/<str:discovery_start>/<str:discovery_end>",
        get_maintainer_faults,
        name="get_maintainer_faults",
    ),
    path(
        "maintainer/earliest_fault/<str:user_id>", get_earliest_maintainer_fault, name="get_earliest_maintainer_fault"
    ),
    path("vantage_transform_faults/", transform_faults, name="vantage_transform_faults"),
]
