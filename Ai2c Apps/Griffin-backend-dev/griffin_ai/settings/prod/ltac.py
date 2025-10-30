"""
griffin_ai settings for LTAC deployment

------
Notes:
"""

from ..base import *

# Production Deployment, set to False
DEBUG = False


# Customize Allowed Hosts
ALLOWED_HOSTS = ["localhost"]


# Database Definition
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Static files (CSS, JavaScript, Images)
# need griffin-ai base to avoid LTAC nginx proxy conflict
STATIC_URL = "/griffin-ai/static/"
