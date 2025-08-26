from django.db import models
from django.utils.translation import gettext_lazy as _


class ManualInspection(models.Model):
    """
    Defines a Raw Inspections Record
    """

    serial = models.CharField("Aircraft for Inspection Serial Number", primary_key=True, max_length=16)
    insp_1 = models.FloatField("Airframe hours when the First inspection type for this model is due", null=True)
    insp_2 = models.FloatField(
        "Airframe hours when the Second inspection type for this model is due",
        null=True,
    )
    insp_3 = models.FloatField("Airframe hours when the Third inspection type for this model is due", null=True)

    class Meta:
        db_table = "raw_manual_inspections"
        verbose_name_plural = "RawManualInspections"

    def __str__(self):
        return "{}: 1: {}hrs, 2: {}hrs, 3: {}hrs".format(self.serial, self.insp_1, self.insp_2, self.insp_3)


class ManualUICOverride(models.Model):
    """
    Defines a manual override of an aircraft's UIC

    ------
    Notes:
    1. A manually overriden aircraft UIC fixes the persistent issue of aircraft transfers, an aircraft's UIC is updated
       before we store it in our database
    """

    serial = models.CharField("Aircraft Serial Number", primary_key=True, max_length=16)
    uic = models.CharField("Unit Identification Code", max_length=6)

    class Meta:
        db_table = "raw_manual_uic_override"
        verbose_name_plural = "RawManualUICOverride"

    def __str__(self):
        return "{} should be in {}".format(self.serial, self.uic)
