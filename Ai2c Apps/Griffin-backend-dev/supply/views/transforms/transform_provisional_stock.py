from django.http import HttpRequest, HttpResponse

from utils.transform.transform_provisional_stock import transform_provisional_stock as tps


def transform_provisional_stock(request: HttpRequest):
    """
    Transforms provisional stock from their raw form in Vantage to the Centaur data model
    A unique stock:
        plant
        storage_location
        serviceable_stock (total_stock is serviceable + non_serviceable and I believe what we want to show is just what's actually available)
        material_description
        material_number (I picked this over the gcss one because it's a bit more generic/easier to trace)
        is_bench_stock
        is_shop_stock
    """

    return HttpResponse(tps())
