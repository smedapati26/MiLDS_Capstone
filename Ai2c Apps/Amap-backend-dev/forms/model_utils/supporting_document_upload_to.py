from django.core.exceptions import FieldError


def supporting_document_file_name(doc, filename: str) -> str:
    """
    Generates a filename for a given Supporing Document to upload to the storage account.
    Filenames are a concatenation of the counseled Soldier's DOD ID number and the database record id.

    NOTE: The instance must have been saved to the database before saving the file name and using this
    method to generate the file name.

    ie:
        certification = Certification.objects.create(...)
        certification.document = File(...)
        certifiation.save()

    @param instance: (forms.models.Certification) the Certification object
    @param filename: (str) the original filename for the file to upload
    @returns (str) the filename to give the counseling when uploaded
    """
    if not doc.id:
        raise FieldError("Object not initialized")
    return "{}/supporting_documents/{}_{}".format(doc.soldier.user_id, doc.id, doc.upload_date)
