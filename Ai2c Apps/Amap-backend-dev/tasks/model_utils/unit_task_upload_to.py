from django.core.exceptions import FieldError


def unit_task_file_name(instance, filename: str) -> str:
    """
    Generates a filename for a given task to upload to the storage account.
    Filenames are made up of the generated user task number.

    NOTE: The instance must have been saved to the database before saving the file name and using this
    method to generate the file name.

    ie:
        task = Task.objects.create(...)
        task.pdf_file = File(...)
        task.save()

    @param instance: (forms.models.Task) the Task object
    @param filename: (str) the original filename for the file to upload
    @returns (str) the filename to give the task pdf when uploaded
    """
    if not instance.task_number:
        raise FieldError("Object not initialized")
    return "unit_tasks/{}.pdf".format(instance.task_number)
