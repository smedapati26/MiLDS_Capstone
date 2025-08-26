from django.db import models

from auto_dsr.models import User, Unit
from reports.model_utils import dsr_upload_to


class DailyStatusReport(models.Model):
    """
    Defines a DSR export generated using Griffin's reporting application

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_column="user_dodid")
    generated_at = models.DateTimeField("The Timestamp when this report was generated (UTC)")
    csv = models.BooleanField("A boolean flag indicating if a set of csvs were generated for the user", default=False)
    document = models.FileField(
        "Griffin Generated DSR document",
        upload_to=dsr_upload_to,
        max_length=1024,
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "reports_daily_status_report"
        verbose_name = "Daily Status Report"
        verbose_name_plural = "Daily Status Reports"

    def __str__(self):
        return "DSR generated on {} by {} for {}".format(
            self.generated_at.date().isoformat(), self.user.name_and_rank(), self.unit.short_name
        )
