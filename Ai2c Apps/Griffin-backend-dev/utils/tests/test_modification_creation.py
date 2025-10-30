from aircraft.model_utils import ModificationTypes
from aircraft.models import Modification


def create_single_test_modification(name: str, type: ModificationTypes = ModificationTypes.OTHER) -> Modification:
    """
    Creates a single Modification object.

    @param name: (str) The primary key value for the new Modification,
    @param type: (str) The Modification Type for this Modification

    @returns (Modification)
            The newly created Modification object.
    """
    return Modification.objects.create(name=name, type=type)
