######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest
from django.views import View

###########################
## Model and App Imports ##
###########################
from .create_designation import create_designation
from .delete_designation import delete_designation
from .list_designation import list_designation
from .read_designation import read_designation
from .update_designation import update_designation


class Designation_ID_RequestHandler(View):
    """
    Handles all Designation requests that require the id in the request.

    @param request (HttpRequest): The calling request object
    @param id (<ID TYPE>): The primary key for Designations.

    @returns (HttpResponse dependent on view and outcome of request)
    """

    def get(self, request: HttpRequest, id):
        return read_designation(request, id)

    def put(self, request: HttpRequest, id):
        return update_designation(request, id)

    def delete(self, request: HttpRequest, id):
        return delete_designation(request, id)


class Designation_NO_ID_RequestHandler(View):
    """
    Handles all Designation requests without the id in the request.

    @param request (HttpRequest): The calling request object

    @returns (HttpResponse dependent on view and outcome of request)
    """

    def post(self, request: HttpRequest):
        return create_designation(request)

    def get(self, request: HttpRequest):
        return list_designation(request)
