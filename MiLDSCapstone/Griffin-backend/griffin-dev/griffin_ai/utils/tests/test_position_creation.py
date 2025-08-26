from auto_dsr.models import Position

def create_single_test_position(
    title = "PC Officer",
    abbreviation = "PC OIC",
) -> Position:
    """
    Creates a single Position object.

    @param title: (str) Full position title
    @param abbreviation: (str) Position abbreviation

    @returns (Position)
            The newly created Position object.
    """
    return Position.objects.create(
        title=title,
        abbreviation=abbreviation,
    )
