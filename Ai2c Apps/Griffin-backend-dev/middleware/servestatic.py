import logging

from django.http import HttpResponseNotFound, StreamingHttpResponse

CONTENT_TYPES = {
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css",
    "ttf": "font/ttf",
    "woff": "font/woff",
    "woff2": "font/woff2",
    "svg": "image/svg+xml",
    "webmanifest": "application/manifest+json",
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
        if "assets" in request.path:
            content_type = get_content_type(request.path)
            try:
                response = StreamingHttpResponse(
                    open(f"static/{request.path[request.path.index('assets') :]}", "rb"),
                    content_type=content_type,
                )
            except Exception as e:
                logging.critical(f"static file failed to open {e}")
                return HttpResponseNotFound(f"{request.path} not found")
        elif "static" in request.path:
            content_type = get_content_type(request.path)
            headers = {}
            if content_type == "application/manifest+json":
                headers = {"Service-Worker-Allowed": "/"}
            try:
                response = StreamingHttpResponse(
                    open(request.path[request.path.index("static") :], "rb"),
                    content_type=content_type,
                    headers=headers,
                )
            except Exception as e:
                logging.critical(f"static file failed to open {e}")
                return HttpResponseNotFound(f"{request.path} not found")
        else:
            response = self.get_response(request)

        return response
