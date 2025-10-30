from django.core.exceptions import FieldError


def dsr_upload_to(instance, filename: str) -> str:
    """
    Generates a filename for a given DSR to generate.

    ie:
        dsr = DailyStatusReport.objects.create(...)
        dsr.document = File(...)
        dsr.save()

    @param instance: (reports.models.DailyStatusReport) the DailyStatusReport object
    @param filename: (str) the original filename generated
    @returns (str) the filename to give the dsr when uploaded
    """
    if not instance.id:
        raise FieldError("Object not initialized")
    return "dsr/{}/{}".format(instance.unit.uic, filename)
