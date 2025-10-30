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

TEST_RUNNER = "xmlrunner.extra.djangotestrunner.XMLTestRunner"
TEST_OUTPUT_DIR = "test-results"
TEST_OUTPUT_FILE_NAME = "test-report.xml"

# CORS Options
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
CORS_ALLOW_HEADERS = (
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "x-on-behalf-of",
)
