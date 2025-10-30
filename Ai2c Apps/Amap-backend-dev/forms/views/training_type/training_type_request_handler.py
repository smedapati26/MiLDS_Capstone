######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest
from django.views import View

###########################
## Model and App Imports ##
###########################
from .list_training_type import list_training_type


class TrainingType_NO_ID_RequestHandler(View):
    """
    Handles all TrainingType requests without the id in the request.

    @param request (HttpRequest): The calling request object

    @returns (HttpResponse dependent on view and outcome of request)
    """

    def get(self, request: HttpRequest):
        return list_training_type(request)
