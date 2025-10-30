from rest_framework.generics import ListAPIView

from auto_dsr.models import TaskForce
from auto_dsr.serializers import TaskForceUICSerializer


class ListTaskForceUICs(ListAPIView):
    queryset = TaskForce.objects.all()
    serializer_class = TaskForceUICSerializer
