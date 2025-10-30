from personnel.model_utils import UserRoleAccessLevel
from personnel.models import Soldier, Unit, UserRequest


def create_test_user_request(
    user_id: Soldier, uic: Unit, id: int = 1, access_level: UserRoleAccessLevel = UserRoleAccessLevel.VIEWER
) -> UserRequest:
    user_request = UserRequest.objects.create(id=id, user_id=user_id, uic=uic, access_level=access_level)

    return user_request
