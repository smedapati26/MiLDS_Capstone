"""
amap settings for DSE TEST Environment deployment

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

load_dotenv()

from ..base import *

# Development, set True
DEBUG = True

# Customize Allowed Hosts
ALLOWED_HOSTS = ["127.0.0.1", "localhost", "apps.dse.futures.army.mil"]


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

# Storage configuration

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

#   Max Upload Size
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880

# Timezone
USE_TZ = True

# Email Settings
EMAIL_HOST = "smtp.az.cloud.army.mil"
EMAIL_PORT = 25

configure_azure_monitor(connection_string=os.environ["AZ_APP_INSIGHTS"])
