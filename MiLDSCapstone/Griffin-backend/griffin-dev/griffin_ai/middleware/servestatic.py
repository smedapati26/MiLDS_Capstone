from django.http import StreamingHttpResponse

import logging


CONTENT_TYPES = {
    "png": "image/png",
    "svg": "image/svg+xml",
    "js": "text/javascript",
    "css": "text/css",
    "ttf": "font/ttf",
}


def get_content_type(request_path):
    extension = request_path.split(".")[-1]
    try:
        content_type = CONTENT_TYPES[extension]
    except Exception as e:
        logging.critical(f"content type {extension} not found {e}")
    return content_type


class ServeStaticMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if "static" in request.path:
            logging.critical("requested static file")
            logging.critical(f"opening {request.path[request.path.index('static'):]}")
            content_type = get_content_type(request.path)
            try:
                response = StreamingHttpResponse(
                    open(request.path[request.path.index("static") :], "rb"),
                    content_type=content_type,
                )
            except Exception as e:
                logging.critical(f"file failed to open {e}")

        else:
            response = self.get_response(request)

        return response
