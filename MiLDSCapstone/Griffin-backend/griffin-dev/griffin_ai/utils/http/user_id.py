def get_user_string(headers: dict[str, str]) -> str:
    """
    Given an HTTP Request's headers object, get the user string for the requestor

    @param headers: (dict[str, str]) the HttpRequest headers object
    @returns (str) the user_string representing someone's authenticated identity
    """
    user_string = headers.get("Auth-User", None)
    if not user_string:
        user_string = "CN=DOE.JOHN.A.0000000000,OU=USA,OU=PKI"  # Admin
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
