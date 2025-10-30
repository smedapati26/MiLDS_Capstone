from functools import wraps
from typing import Generic, List, TypeVar

from ninja import Schema

T = TypeVar("T")


class PaginatedResponseType(Schema, Generic[T]):
    data: List[T]
    total_count: int


def paginate_with_total_count(method):
    @wraps(method)
    def wrapper(request, *args, **kwargs):
        return_data = method(request, *args, **kwargs)

        limit = int(request.GET.get("limit", 10))
        offset = int(request.GET.get("offset", 0))

        return_slice = return_data[offset * limit : offset * limit + limit]
        total_count = len(return_data)

        return {"data": return_slice, "total_count": total_count}

    return wrapper
