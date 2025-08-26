######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest
from django.views import View

###########################
## Model and App Imports ##
###########################
from .list_award_type import list_award_type


class AwardType_NO_ID_RequestHandler(View):
    """
    Handles all AwardType requests without the id in the request.

    @param request (HttpRequest): The calling request object

    @returns (HttpResponse dependent on view and outcome of request)
    """

    def get(self, request: HttpRequest):
        return list_award_type(request)
