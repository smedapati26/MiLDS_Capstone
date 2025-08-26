from datetime import date
from django.db import models
from forms.models import DA_4856, Soldier


def create_test_4856(
    soldier: Soldier,
    document: models.FileField,
    id: int = 1,
    date: date = date(2021, 12, 4),
    title: str = "TST_COUNSELING",
) -> DA_4856:
    """
    Creates a single DA4856 object.

    @param soldier: (Soldier) The Soldier object that the couseling is to be assigned to
    @param document: (FileField) The DA4856 File for the couseling
    @param id: (int) The primary key
    @param date: (date) The date of the couseling
    @param title: (str) The title of the counseling

    @ returns (DA_4856)
                The newly created counseling
    """
    return DA_4856.objects.create(id=id, date=date, soldier=soldier, title=title, document=document)
