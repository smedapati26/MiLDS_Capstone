from django.db import models
from simple_history.models import HistoricalRecords

from personnel.model_utils import MosCode
from personnel.models import Soldier
from tasks.model_utils import Proponent, SkillLevel, unit_task_file_name
from units.models import Unit


class MOS(models.Model):
    """
    Defines the model for MOS
    """

    id = models.BigAutoField("Auto Unique ID", primary_key=True)
    mos_code = models.CharField("MOS Code", max_length=3, choices=MosCode.choices, null=True, blank=True)

    class Meta:
        db_table = "mos"
        verbose_name_plural = "mos"

    def __str__(self):
        return "{}".format(self.mos_code)


class MosIctls(models.Model):
    """
    Defines the model for MOS codes to their corresponding ICTLs
    """

    id = models.BigAutoField("Auto Unique ID", primary_key=True)
    mos = models.ForeignKey(MOS, on_delete=models.CASCADE, db_column="mos")
    ictl = models.ForeignKey("Ictl", on_delete=models.CASCADE, db_column="ictl")

    class Meta:
        verbose_name_plural = "MosIctls"

    def __str__(self):
        return "{} <- {}".format(self.mos, self.ictl)


class Ictl(models.Model):
    """
    Defines the model for an individual critical task list
    """

    ictl_id = models.BigAutoField("Auto Unique Id", primary_key=True)
    ictl_title = models.CharField("ICTL Title", max_length=75)
    date_published = models.DateField("Date the ICTL was published")
    proponent = models.CharField("Propenent", max_length=10, choices=Proponent.choices, null=True, blank=True)
    unit = models.ForeignKey("units.Unit", on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField("ICTL Status", max_length=20, null=True, blank=True)
    skill_level = models.CharField(
        "Skill Level",
        max_length=3,
        choices=SkillLevel.choices,
        null=True,
        blank=True,
    )
    mos = models.ManyToManyField(MOS, through=MosIctls)
    target_audience = models.CharField("Target Audience", max_length=240, null=True, blank=True)
    history = HistoricalRecords(
        user_model=Soldier,
        m2m_fields=[mos],
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: Soldier.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        db_table = "ictl"
        verbose_name_plural = "ictl"

    def __str__(self):
        return "{}".format(self.ictl_title)


class IctlTasks(models.Model):
    """
    Defines the relationship between an Individul Critical Task List
    and the tasks contained therein.
    """

    id = models.BigAutoField("Auto Unique ID", primary_key=True)
    task = models.ForeignKey("Task", on_delete=models.CASCADE, db_column="task_number")
    ictl = models.ForeignKey(Ictl, on_delete=models.CASCADE, db_column="ictl_id")

    class Meta:
        db_table = "ictl_tasks"
        verbose_name_plural = "ictl tasks"

    def __str__(self):
        return "{} <- Task # {}".format(self.ictl.ictl_title, self.task.task_number)


class Task(models.Model):
    """ "
    Defines the model for an individual critical task
    """

    task_number = models.CharField("Task Number", max_length=20, primary_key=True)
    ictl = models.ManyToManyField(Ictl, through=IctlTasks)
    task_title = models.CharField("Task Title", max_length=240)
    pdf_url = models.URLField("Task PDF Url", null=True, blank=True)
    unit = models.ForeignKey(
        Unit,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="unit_tasks",
        db_column="task_unit",
    )
    unit_task_pdf = models.FileField(
        "Uploaded Task pdf file",
        upload_to=unit_task_file_name,
        max_length=1024,
        null=True,
    )
    training_location = models.CharField("Training Location", max_length=50, null=True, blank=True)
    frequency = models.CharField("Training Frequency", max_length=30, null=True, blank=True)
    subject_area = models.CharField("Subject Area", max_length=100, null=True, blank=True)
    deleted = models.BooleanField(default=False)
    history = HistoricalRecords(
        user_model=Soldier,
        m2m_fields=[ictl],
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: Soldier.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        db_table = "task"
        verbose_name_plural = "tasks"

    def __str__(self):
        return "Task Number {}: {}".format(self.task_number, self.task_title)
