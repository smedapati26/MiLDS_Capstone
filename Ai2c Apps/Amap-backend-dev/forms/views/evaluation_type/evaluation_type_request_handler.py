######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest
from django.views import View

###########################
## Model and App Imports ##
###########################
from .list_evaluation_type import list_evaluation_type


class EvaluationType_NO_ID_RequestHandler(View):
    """
    Handles all EvaluationType requests without the id in the request.

    @param request (HttpRequest): The calling request object

    @returns (HttpResponse dependent on view and outcome of request)
    """

    def get(self, request: HttpRequest):
        return list_evaluation_type(request)
