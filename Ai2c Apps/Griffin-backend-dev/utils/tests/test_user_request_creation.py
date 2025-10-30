from django.utils import timezone

from auto_dsr.model_utils.status_manager import Statuses
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import Unit, User, UserRequest


def create_test_user_request(
    unit: Unit,
    user: User,
    access_level: str = UserRoleAccessLevel.READ,
    status: str = Statuses.NEW,
    date_created=timezone.now(),
    date_updated=timezone.now(),
) -> UserRequest:
    """
    Creates a User Request object for test.

    @param unit: (Unit) The Unit object the user request
    @param user: (User) The User object for the user request
    @param access_level: (str) Access Level for the request

    @returns (UserRequest)
            The new UserRequest object.
    """
    return UserRequest.objects.create(
        user_id=user,
        uic=unit,
        access_level=access_level,
        status=status,
        date_created=date_created,
        date_updated=date_updated,
    )
