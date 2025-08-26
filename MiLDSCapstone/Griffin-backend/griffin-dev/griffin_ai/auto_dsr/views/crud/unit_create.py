from rest_framework.generics import CreateAPIView

from auto_dsr.models import Unit
from auto_dsr.serializers import UnitSerializer


class CreateUnit(CreateAPIView):
    """
    API endpoint to create a new `Unit` instance and its associated `TaskForce` entry.
    The view supports manual input of the UIC (Unit Identification Code) by the user.
    If the UIC is not provided, the system will auto-generate a unique UIC.
    When a `Unit` is successfully created, an associated entry in the `TaskForce`
    table is also created using the provided `start_date` and `end_date`.

    Attributes:
        queryset: The base query used to search for `Unit` instances.
        serializer_class: The serializer class used to validate and create the `Unit` instance.

    Methods:
        - `get`: Handles the GET request to retrieve the form for creating a `Unit`.
        - `post`: Handles the POST request to create a new `Unit` and its associated `TaskForce` entry.
    """

    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
