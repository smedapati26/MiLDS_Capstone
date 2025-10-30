from django.http import HttpRequest, HttpResponse

from utils.transform.transform_work_orders import transform_work_orders as two


def transform_work_orders(request: HttpRequest):
    """
    Transforms Work Orders to specific Equipment Work Orders
    Note: The copy from raw utility should not be used as each equipment has to be found then mapped to the specific table.
    """
    return HttpResponse(two())
