from personnel.models import GradeRank


def test_create_grades():
    """
    Create grade table data.
    """
    for rank in [
        "O1E",
        "E9",
        "O2E",
        "E8",
        "E4",
        "E7",
        "O5",
        "O1",
        "W2",
        "O9",
        "O8",
        "O7",
        "E5",
        "O2",
        "W1",
        "W5",
        "O3E",
        "O3",
        "E0",
        "E3",
        "E6",
        "O6",
        "E1",
        "W3",
        "O4",
        "E2",
        "W4",
    ]:
        GradeRank.objects.create(code=rank)

    return GradeRank.objects.all()
