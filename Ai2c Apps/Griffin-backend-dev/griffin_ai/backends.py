from auto_dsr.models import User
from utils.http import get_user_id


class AccountAuthBackend(object):
    @staticmethod
    def authenticate(request):
        try:
            user_id = get_user_id(request.headers)
            user = User.objects.get(user_id=user_id)
            return user
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_user(user_id):
        try:
            return User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return None
