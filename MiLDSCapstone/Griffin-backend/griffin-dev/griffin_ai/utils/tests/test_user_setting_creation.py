from auto_dsr.models import User, Unit, UserSetting


def create_single_user_setting(unit: Unit, user: User, preferences: dict = {"test_preferences": "Test"}):
    return UserSetting.objects.create(unit=unit, user=user, preferences=preferences)
