from django.http import HttpRequest, FileResponse
from django.http.multipartparser import Parser
from django.utils import timezone
from functools import wraps
import json

from personnel.models import Soldier
from forms.models import APICallLogging


def log_api_call(view_func):
    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs):
        current_time = timezone.now()

        soldier = None
        request_body = None

        if "X-On-Behalf-Of" in request.headers:
            soldier_id = request.headers["X-On-Behalf-Of"]
            try:
                soldier = Soldier.objects.get(user_id=soldier_id)
            except Soldier.DoesNotExist:
                pass

        if request.META.get("CONTENT_TYPE", None) is not None and request.META["CONTENT_TYPE"].startswith(
            "multipart/form-data"
        ):
            request_body = request.body
        else:
            request_body = request.body.decode("utf-8")

        request_data = {
            "headers": str(request.headers),
            "method": str(request.method),
            "body": str(request_body),
            "path": str(request.path),
            "path_info": str(request.path_info),
        }

        response = view_func(request, *args, **kwargs)

        if isinstance(response, FileResponse):
            response_content = response.filename
        else:
            response_content = response.content.decode("utf-8")

        response_data = {
            "class": str(type(response)),
            "status_code": str(response.status_code),
            "content": response_content,
        }

        log = APICallLogging.objects.create(
            request=request_data, response=response_data, request_made_by=soldier, time_of_request=current_time
        )

        return response

    return wrapper
