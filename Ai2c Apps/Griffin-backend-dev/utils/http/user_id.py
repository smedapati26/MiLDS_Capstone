import json

from django.conf import settings
from jwt.utils import base64url_decode


def get_user_string(headers: dict[str, str]) -> str:
    """
    Given an HTTP Request's headers object, get the user string for the requestor

    @param headers: (dict[str, str]) the HttpRequest headers object
    @returns (str) the user_string representing someone's authenticated identity
    """
    auth_string = headers.get("Authorization", None)
    user_id = None
    if auth_string and auth_string.startswith("Bearer "):
        token = auth_string[len("Bearer ") :].strip()
        try:
            segment, _ = token.encode("utf-8").rsplit(b".", 1)
            _, payload = segment.split(b".", 1)
            full_jwt = json.loads(base64url_decode(payload))
            user_id = full_jwt["x509"]["usercertificateIdentity"][:10]

        except Exception:
            pass

    user_string = user_id if user_id else headers.get("Auth-User", None)
    if not user_string and settings.DEBUG:
        user_string = "CN=DOE.JOHN.A.0000000000,OU=USA,OU=PKI"  # Admin
    if not user_string and not settings.DEBUG:
        user_string = ""
    return user_string


def parse_user_id(user_string: str) -> str:
    """
    Given a user string get the user_id
    @param user_string: (str) the user's identity string
    @returns (str) the user_id (a person's DOD ID number)
    """
    user_identifier = user_string.split(",")[0]
    return user_identifier.split(".")[-1]


def get_user_id(headers: dict[str, str]) -> str:
    """
    Given an HTTP Request's headers object, get the user id for the requestor

    @param headers: (dict[str, str]) the HttpRequest headers object
    @returns (str) the user_id (a person's DOD ID number)
    """
    user_string = get_user_string(headers)
    user_id = parse_user_id(user_string)
    return user_id


def parse_user_name(user_string: str) -> tuple[str, str]:
    """
    Given a user string get the user's first and last name
    @param user_string: (str) the user's identity string
    @returns (str, str) the user's first and last names
    """
    user_identifier = user_string.split(",")[0].split("=")[-1]
    user_id_list = user_identifier.split(".")
    return (user_id_list[1], user_id_list[0])


def get_user_name(headers: dict[str, str]) -> tuple[str, str]:
    """
    Given an HTTP Request's headers object, get the user id for the requestor

    @param headers: (dict[str, str]) the HttpRequest headers object
    @returns (str, str) the user's first and last name
    """
    user_string = get_user_string(headers)
    user_names = parse_user_name(user_string)
    return user_names
