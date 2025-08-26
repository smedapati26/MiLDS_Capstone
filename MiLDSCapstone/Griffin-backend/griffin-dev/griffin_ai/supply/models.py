from django.db import models

from aircraft.models import Aircraft
from agse.models import AGSE
from auto_dsr.models import Unit


class PartsOrder(models.Model):
    """
    Defines the key information required for supply tracking.
    The primary key is the DOD Document Number because only 1 unique DOD Document Number
    can be used at any time.
    We are currently searching IGC for the current status/location of an order.

    ------
    Notes:
    1. dod_document_number : references the unique DOD Document Number given once an order has been placed
    2. carrier : The carrier for reference to lookup by the tracking number
    3. carrier_tracking_number : tracking number if carried by non-DOD carrier
    4. equipment_choices : Either AGSE or Aviation. Aviation is the default.
    5. is_visible : Whether or not it's visible in the user's table. Default is true.
    """

    dod_document_number = models.CharField("DOD Document Number", max_length=15, primary_key=True)
    carrier = models.CharField("Shipment carrier ie. UPS/FEDEX", max_length=128, null=True, blank=True)
    carrier_tracking_number = models.CharField("Carrier Tracking Number", max_length=64, null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    aircraft = models.ForeignKey(
        Aircraft, on_delete=models.PROTECT, db_column="aircraft_serial_number", blank=True, null=True
    )
    agse = models.ForeignKey(AGSE, on_delete=models.PROTECT, db_column="agse_equipment_number", blank=True, null=True)
    is_visible = models.BooleanField("A boolean flag to track if a user wants to view this on their DSR", default=True)

    class Meta:
        verbose_name_plural = "Parts Orders"

    def __str__(self):
        if self.agse:
            return "{} ordered {} for {}".format(self.unit, self.dod_document_number, self.agse)
        else:
            return "{} ordered {} for {}".format(self.unit, self.dod_document_number, self.aircraft)
