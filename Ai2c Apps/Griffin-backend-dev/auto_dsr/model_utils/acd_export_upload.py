from datetime import datetime

from django.core.exceptions import FieldError


def acd_export_upload_to(instance, filename: str) -> str:
    """
    Generates a filename for a given ACD Export to upload to.

    ie:
        export = ACDExport.objects.create(...)
        export.document = File(...)
        export.save()

    @param instance: (auto_dsr.models.ACDExport) the ACDExport object
    @param filename: (str) the original filename
    @returns (str) the filename to give the ACD Export when uploaded
    """
    if not instance.id:
        raise FieldError("Object not initialized")
    if instance.upload_type in ["xlsx", "xml"]:
        return "acd/exports/{}/{}.{}".format(instance.unit.uic, datetime.now(), instance.upload_type)
    else:
        raise FieldError("Incorrect upload type specified")
