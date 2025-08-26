######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest
from django.views import View

###########################
## Model and App Imports ##
###########################
from .list_tcs_location import list_tcs_location


class TCSLocation_NO_ID_RequestHandler(View):
    """
    Handles all TCSLocation requests without the id in the request.

    @param request (HttpRequest): The calling request object

    @returns (HttpResponse dependent on view and outcome of request)
    """

    def get(self, request: HttpRequest):
        return list_tcs_location(request)
