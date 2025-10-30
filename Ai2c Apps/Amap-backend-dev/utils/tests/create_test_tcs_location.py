from forms.models import TCSLocation


def create_test_tcs_location(abbreviation: str = "ABBR", location: str = "Test Location") -> TCSLocation:
    tcs_location = TCSLocation.objects.get_or_create(abbreviation=abbreviation, location=location)[0]

    return tcs_location
