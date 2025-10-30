from aircraft.models import Modification, ModificationCategory


def create_single_test_modification_category(
    modification: Modification, value: str = "Category", description: str = "Category Description"
) -> ModificationCategory:
    """
    Creates a single Modification object.

    @param modification: (Modification) The Modification object this category is being created for
    @param name: (str) The primary key value for the new Modification,
    @param type: (str) The Modification Type for this Modification

    @returns (ModificationCategory)
            The newly created ModificationCategory object.
    """
    return ModificationCategory.objects.create(modification=modification, value=value, description=description)
