######################################
## Django and Other Library Imports ##
######################################
from django.db.models import Q
from django.http import HttpRequest, HttpResponseBadRequest, JsonResponse

###########################
## Model and App Imports ##
###########################
from personnel.models import MOSCode

#####################
## Utility Imports ##
#####################


def list_mos_code(request: HttpRequest, type: str):
    """
    Returns designated queried MOSCode object data.

    @param request (HttpRequest): The calling request object
    @param type (str): the type of request
        - "all" return all mos - default
        - "amtp" return mos that apply to amtp
        - "ictl" return mos that have ictls
        - "amtp_or_ictl" return mos that are either amtp or ictl mos

    @returns (JsonResponse | HttpBadRequest)
    """
    # Query Django Models
    # ---------------------------

    if type == "all":
        mos_codes = MOSCode.objects.all()
    elif type == "amtp":
        mos_codes = MOSCode.objects.filter(amtp_mos=True)
    elif type == "ictl":
        mos_codes = MOSCode.objects.filter(ictl_mos=True)
    elif type == "amtp_or_ictl":
        mos_codes = MOSCode.objects.filter(Q(ictl_mos=True) | Q(amtp_mos=True))
    else:
        return HttpResponseBadRequest("Type of MOS request not recognized")

    # Manipulate Models and Data
    # ---------------------------
    mos_code_values = mos_codes.values("mos", "mos_description").order_by("-amtp_mos", "-ictl_mos", "mos")

    # Build Return Data
    # ---------------------------
    return_data = [
        {"MOS": mos_code["mos"], "MOS Description": mos_code["mos_description"]} for mos_code in mos_code_values
    ]

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
