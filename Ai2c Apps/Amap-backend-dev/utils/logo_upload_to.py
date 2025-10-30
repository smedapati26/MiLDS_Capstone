from django.core.exceptions import FieldError


def unit_logo_upload_to(instance, filename: str) -> str:
    """
    Generates a filename for a given unit logo to upload to.

    ie:
        unit = Unit.objects.create(...)
        unit.logo = Image(...)
        unit.save()

    @param instance: (units.models.Unit) the Unit object
    @param filename: (str) the original filename
    @returns (str) the filename to give the Unit logo when uploaded
    """
    if not instance.uic:
        raise FieldError("Object not initialized")
    extension = filename.split(".")[-1]
    return "logos/unit/{}.{}".format(instance.uic, extension)
