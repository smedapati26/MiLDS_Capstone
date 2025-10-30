"""
WSGI config for griffin_ai project.
"""

import os

from django.core.wsgi import get_wsgi_application

import griffin_ai.safetar_patch

application = get_wsgi_application()
