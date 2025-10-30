######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest
from django.views import View

###########################
## Model and App Imports ##
###########################
from .create_soldier_designation import create_soldier_designation
from .delete_soldier_designation import delete_soldier_designation
from .list_soldier_designation import list_soldier_designation
from .read_soldier_designation import read_soldier_designation
from .update_soldier_designation import update_soldier_designation


class SoldierDesignation_ID_RequestHandler(View):
    """
    Handles all SoldierDesignation requests that require the id in the request.

    @param request (HttpRequest): The calling request object
    @param id (<ID TYPE>): The primary key for SoldierDesignations.

    @returns (HttpResponse dependent on view and outcome of request)
    """

    def get(self, request: HttpRequest, id):
        return read_soldier_designation(request, id)

    def put(self, request: HttpRequest, id):
        return update_soldier_designation(request, id)

    def delete(self, request: HttpRequest, id):
        return delete_soldier_designation(request, id)


class SoldierDesignation_NO_ID_RequestHandler(View):
    """
    Handles all SoldierDesignation requests without the id in the request.

    @param request (HttpRequest): The calling request object

    @returns (HttpResponse dependent on view and outcome of request)
    """

    def post(self, request: HttpRequest):
        return create_soldier_designation(request)

    def get(self, request: HttpRequest):
        return list_soldier_designation(request)
