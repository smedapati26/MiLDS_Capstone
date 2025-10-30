from django.core.exceptions import FieldError


def counseling_file_name(instance, filename: str) -> str:
    """
    Generates a filename for a given counseling to upload to the storage account.
    Filenames are a concatenation of the counseled Soldier's DOD ID number and the database record id.

    NOTE: The instance must have been saved to the database before saving the file name and using this
    method to generate the file name.

    ie:
        counseling = DA_4856.objects.create(...)
        counseling.document = File(...)
        counseling.save()

    @param instance: (forms.models.DA_4856) the DA_4856 object
    @param filename: (str) the original filename for the file to upload
    @returns (str) the filename to give the counseling when uploaded
    """
    if not instance.id:
        raise FieldError("Object not initialized")
    return "counselings/{}/{}_{}.pdf".format(instance.soldier.user_id, instance.id, instance.date)
