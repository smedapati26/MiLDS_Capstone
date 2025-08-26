"""
amap settings for local deployment

------
Notes:
"""

from dotenv import load_dotenv

load_dotenv()

from ..base import *

# Local Development, set True
DEBUG = True


# Customize Allowed Hosts
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


# Database Definition
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Storage configuration

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}
STATIC_URL = "/amap/static/"
