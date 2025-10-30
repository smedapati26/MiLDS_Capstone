import os
from datetime import datetime, timezone

from azure.identity import ClientSecretCredential


def get_token(token=None):
    current_time_utc = datetime.now(timezone.utc).timestamp()
    credential = ClientSecretCredential(
        os.environ["AZURE_TENANT_ID"], os.environ["AZURE_CLIENT_ID"], os.environ["AZURE_CLIENT_SECRET"]
    )
    if not token or (token and token.expires_on < current_time_utc):
        token = credential.get_token("https://database.usgovcloudapi.net/.default")

    return token
