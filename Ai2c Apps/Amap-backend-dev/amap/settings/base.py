"""
Django settings for amtp.ai project.
"""

import os
from pathlib import Path

from csp.constants import SELF

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-p6yuofsi^7-k&xe=vjz94ys2^^#d*1xhxed*s+1v588eqosfa^"
# TODO Make sure the Django key gets revoked, changed, and removed from the code.

local_addr = os.environ["POD_IP_ADDRESS"] if hasattr(os.environ, "POD_IP_ADDRESS") else "localhost"

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "polymorphic",
    "simple_history",
    "personnel",
    "forms",
    "tasks",
    "notifications",
    "faults",
    "consistency",
    "units",
    "csp",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "utils.middleware.servestatic.ServeStaticMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
    "csp.middleware.CSPMiddleware",
]

ROOT_URLCONF = "amap.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "amap.wsgi.application"


# Password validation

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTHENTICATION_BACKENDS = ["django.contrib.auth.backends.ModelBackend", "amap.backends.AccountAuthBackend"]


# Internationalization

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Default primary key field type

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Static Files Configuration

BASE_URL = os.environ.get("BASE_URL", "")

STATIC_URL = BASE_URL + "static/"
STATIC_ROOT = "static/"
# STATICFILES_DIRS = ["../frontend/dist/"]

CONTENT_SECURITY_POLICY = {
    "EXCLUDE_URL_PREFIXES": ["/admin"],
    "DIRECTIVES": {
        "default-src": [
            SELF,
            "http://amap-backend:8000",
            "http://amap-frontend-shiny",
            "*.ai.army.mil",
            f"http://{local_addr}:8000",
        ],
        "script-src": [
            SELF,
            "https://cdn.jsdelivr.net",
            "http://amap-backend:8000",
            "http://amap-frontend-shiny",
            "'sha256-C05Owt+DFaBrpXefO5MsXW5ZwXTKEGfZtOcW1f/Nt1o='",  # Swagger hash
            "*.ai.army.mil",
            f"http://{local_addr}:8000",
        ],
        "fonts-src": [SELF, "http://amap-backend:8000", "http://172.19.2.136:8000", "*.ai.army.mil"],
        "style-src": [
            SELF,
            "https://cdn.jsdelivr.net",
            "https://fonts.googleapis.com",
            "http://amap-backend:8000",
            "http://amap-frontend-shiny",
            "*.ai.army.mil",
            f"http://{local_addr}:8000",
        ],
        "img-src": [
            SELF,
            "data:",
            "https://django-ninja.dev",
            "http://amap-backend:8000",
            "http://amap-frontend-shiny",
            "*.ai.army.mil",
            f"http://{local_addr}:8000",
        ],
        "frame-ancestors": [
            SELF,
            "http://amap-backend:8000",
            "http://amap-frontend-shiny",
            "*.ai.army.mil",
            f"http://{local_addr}:8000",
        ],
        "form-action": [
            SELF,
            "http://amap-backend:8000",
            "http://amap-frontend-shiny",
            "*.ai.army.mil",
            f"http://{local_addr}:8000",
        ],
    },
}
CSP_INCLUDE_NONCE_IN = ["default-src", "script-src", "fonts-src", "style-src"]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True
