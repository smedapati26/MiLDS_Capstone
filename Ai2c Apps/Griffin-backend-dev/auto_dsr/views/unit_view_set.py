from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from auto_dsr.models import Unit
from auto_dsr.serializers import UnitSerializer


class UnitViewSet(ViewSet):
    """
    A simple ViewSet for listing, retrieving, or filtering units based on display_name, short_name, or uic.
    """

    def list(self, request):
        """
        List all units.
        The `many=True` argument is used because we have multiple unit objects that we need to serialize.
        """
        queryset = Unit.objects.all()
        serializer = UnitSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """
        Retrieve a specific unit by pk/id.
        `get_object_or_404` is used to get the object or return a 404 error if the object does not exist.
        """
        queryset = Unit.objects.all()
        unit = get_object_or_404(queryset, pk=pk)
        serializer = UnitSerializer(unit)
        return Response(serializer.data)
