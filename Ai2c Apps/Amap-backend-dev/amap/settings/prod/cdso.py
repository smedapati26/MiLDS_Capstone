"""
amap settings for cDSO Development Environment deployment

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

# from azure.monitor.opentelemetry import configure_azure_monitor
import os

from azure.identity import ClientSecretCredential
from dotenv import load_dotenv

from utils.auzre_token import get_token

from ..base import *

load_dotenv()


# Customize Allowed Hosts
ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    "apps.dse.futures.army.mil",
    "rstudio.dse.futures.army.mil",
    "amap-backend",
    "amap-backend.backend",
    "amap-backend-internal",
    "amap-backend-internal.amap",
    "amap-backend-internal.amap.svc.cluster.local",
    ".army.mil",
    "172.19.2.136",
]

if "POD_IP_ADDRESS" in os.environ:
    ALLOWED_HOSTS.append(os.environ["POD_IP_ADDRESS"])

# CORS Options
CORS_ORIGIN_ALLOW_ALL = True
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
    "auth-user",
)
# Database Definition
DATABASES = {
    "default": {
        "ENGINE": "amap.pmx_sql",
        "NAME": os.environ["DB_NAME"],
        "TOKEN": get_token().token,
        "HOST": os.environ["DB_HOST"],
        "OPTIONS": {
            "driver": os.environ["DB_DRIVER"],
            "TrustServerCertificate": True,
            "Trusted_Connection": "yes",
        },
        "CONN_MAX_AGE": 60,  # refresh connection every 60s to avoid stale sockets
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

# configure_azure_monitor(connection_string=os.environ["AZ_APP_INSIGHTS"])
