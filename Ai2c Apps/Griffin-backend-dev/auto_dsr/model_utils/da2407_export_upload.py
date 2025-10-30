from datetime import datetime

from django.core.exceptions import FieldError


def da_2407_export_upload_to(instance, filename: str) -> str:
    """
    Generates a filename for a given 2407 Export to upload to.

    ie:
        export = DA2407Export.objects.create(...)
        export.document = File(...)
        export.save()

    @param instance: (auto_dsr.models.DA2407Export) the DA2407Export object
    @param filename: (str) the original filename
    @returns (str) the filename to give the DA2407 Export when uploaded
    """
    if not instance.id:
        raise FieldError("Object not initialized")
    if instance.upload_type in ["xlsx", "xml"]:
        return "work_orders/exports/{}/{}.{}".format(instance.unit.uic, datetime.now(), instance.upload_type)
    else:
        raise FieldError("Incorrect upload type specified")
