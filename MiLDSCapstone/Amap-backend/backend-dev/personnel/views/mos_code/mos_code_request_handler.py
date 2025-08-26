######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest
from django.views import View

###########################
## Model and App Imports ##
###########################
from .list_mos_code import list_mos_code


class MOSCode_NO_ID_RequestHandler(View):
    """
    Handles all MOSCode requests without the id in the request.

    @param request (HttpRequest): The calling request object

    @returns (HttpResponse dependent on view and outcome of request)
    """

    def get(self, request: HttpRequest, type: str):
        return list_mos_code(request, type)
