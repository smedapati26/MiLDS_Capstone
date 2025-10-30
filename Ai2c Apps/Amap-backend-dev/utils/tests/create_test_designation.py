from personnel.models import Designation


def create_test_designation(type: str = "TI", description: str = "Technical Inspector") -> Designation:
    designation = Designation.objects.create(type=type, description=description)

    return designation
