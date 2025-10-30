"""
griffin_ai settings for local deployment

------
Notes:
"""

from ..base import *

# Local Development, set True
DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True

# Customize Allowed Hosts
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


# Database Definition
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Storage Configuration

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        "OPTIONS": {
            "base_url": "/static/",
        },
    },
}

STATIC_URL = "/griffin-ai/static/"

TEST_RUNNER = "xmlrunner.extra.djangotestrunner.XMLTestRunner"
TEST_OUTPUT_DIR = "test-results"
TEST_OUTPUT_FILE_NAME = "test-report.xml"
