"""
griffin_ai settings for DSE TEST Environment deployment

------
Notes:
1. Create a .env file in the same directory as this configuration file
  Set the following variables for DB initialization
  a. DB_NAME
  b. DB_HOST
  c. DB_USER
  d. DB_PASS
  e. DB_DRIVER
"""

import os

from azure.monitor.opentelemetry import configure_azure_monitor
from dotenv import load_dotenv

from ..base import *

# Development, set True
DEBUG = True

load_dotenv()

# Customize Allowed Hosts
ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    "apps.dse.futures.army.mil",
    "griffin-backend",
    "griffin-backend.backend",
    ".army.mil",
    "172.19.2.136",
]


# Database Definition
DATABASES = {
    "default": {
        "ENGINE": "mssql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASS"],
        "HOST": os.environ["DB_HOST"],
        "OPTIONS": {"driver": os.environ["DB_DRIVER"]},
    }
}

# Storage Configuration

STORAGES = {
    "default": {
        "BACKEND": "utils.storage.azure.AzureContainerStorage",
        "OPTIONS": {
            # Storage Settings
            "az_act_url": os.environ["AZ_ACT_URL"],
            "az_container": os.environ["AZ_STG_CONTAINER"],
        },
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

configure_azure_monitor(connection_string=os.environ["AZ_APP_INSIGHTS"])
