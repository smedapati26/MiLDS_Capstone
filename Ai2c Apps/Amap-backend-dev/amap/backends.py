from personnel.models import Soldier
from utils.http import get_user_id


class AccountAuthBackend(object):
    @staticmethod
    def authenticate(request):
        try:
            user_id = get_user_id(request.headers)
            user = Soldier.objects.get(user_id=user_id)
            return user
        except Soldier.DoesNotExist:
            return None

    @staticmethod
    def get_user(user_id):
        try:
            return Soldier.objects.get(user_id=user_id)
        except Soldier.DoesNotExist:
            return None
