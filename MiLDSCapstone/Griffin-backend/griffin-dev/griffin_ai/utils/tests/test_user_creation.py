from auto_dsr.models import User, Unit
from auto_dsr.model_utils import UserRank


def create_test_user(
    unit: Unit,
    user_id: str = "0000000000",
    rank: UserRank = "CTR",
    first_name: str = "Test",
    last_name: str = "User",
    is_admin: bool = False,
) -> User:
    """
    Creates a User object for test.

    @param unit: (Unit) The Unit object the newly created User is to be assigned to
    @param user_id: (str) The primary key EDIPI number value for the newly created User
    @param rank: (UserRank) The rank value for the newly created User
    @param first_name: (str) The first name value for the newly created User
    @param last_name: (str) The last name value for the newly created User
    @param is_admin: (bool) The flag to identify Griffin admin users value for the newly created User

    @returns (User)
            The new User object.
    """
    return User.objects.create(
        user_id=user_id,
        rank=rank,
        first_name=first_name,
        last_name=last_name,
        unit=unit,
        is_admin=is_admin,
    )
