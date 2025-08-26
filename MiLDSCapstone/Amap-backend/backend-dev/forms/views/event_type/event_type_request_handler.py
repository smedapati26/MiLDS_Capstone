######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest
from django.views import View

###########################
## Model and App Imports ##
###########################
from .list_event_type import list_event_type


class EventType_NO_ID_RequestHandler(View):
    """
    Handles all EventType requests without the id in the request.

    @param request (HttpRequest): The calling request object

    @returns (HttpResponse dependent on view and outcome of request)
    """

    # def post(self, request: HttpRequest):
    #     return create_event_type(request)

    def get(self, request):
        return list_event_type(request)
