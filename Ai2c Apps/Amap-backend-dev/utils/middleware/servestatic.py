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
}


def get_content_type(request_path):
    extension = request_path.split(".")[-1]
    try:
        content_type = CONTENT_TYPES[extension]
    except Exception as e:
        logging.critical(f"content type {extension} not found {e}")
    return content_type


# TODO use this fucntion to clean the request path before processing
def clean_path(path):
    """
    Simple string cleaner to prevent XSS injection
    """
    # Remove any HTML/script tags
    import re

    cleaned = re.sub(r"<[^>]*>", "", path)
    # Remove JavaScript protocol
    cleaned = re.sub(r"javascript:", "", cleaned, flags=re.IGNORECASE)
    # Remove common XSS patterns
    cleaned = re.sub(r"on\w+\s*=", "", cleaned, flags=re.IGNORECASE)
    return cleaned


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
            try:
                response = StreamingHttpResponse(
                    open(request.path[request.path.index("static") :], "rb"),
                    content_type=content_type,
                )
            except Exception as e:
                logging.critical(f"static file failed to open {e}")
                return HttpResponseNotFound(f"{request.path} not found")
        else:
            response = self.get_response(request)

        return response
