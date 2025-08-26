from tasks.models import Ictl, Task
from personnel.models import Unit
from django.db import models


def create_test_task(
    # Unit tasks follow structure: UIC-TASK0000
    task_number: str = "TEST000AA-TASK0000",
    task_title: str = "Test Task 0000 - Inspect Aircraft",
    unit: Unit = None,
    unit_task_pdf: models.FileField = None,
    training_location: str = "Operational/Unit",
    frequency: str = "Annually",
    subject_area: str = "01-Aircraft General Maintenance",
) -> Task:
    task = Task.objects.create(
        task_number=task_number,
        task_title=task_title,
        unit=unit,
        unit_task_pdf=unit_task_pdf,
        training_location=training_location,
        frequency=frequency,
        subject_area=subject_area,
    )

    return task
