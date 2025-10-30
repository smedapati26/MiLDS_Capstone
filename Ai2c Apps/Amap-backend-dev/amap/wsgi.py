"""
WSGI config for amap project.
"""

import os

from django.core.wsgi import get_wsgi_application

import amap.safetar_patch

application = get_wsgi_application()
