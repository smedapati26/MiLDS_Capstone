from django.db import models
from django.utils.translation import gettext_lazy as _

from agse.models import AGSE
from aircraft.models import Aircraft, Fault
from auto_dsr.models import Unit
from uas.models import UAV


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


class WorkOrderStatus(models.TextChoices):
    """
    The possible technical statuses
    """

    CREATED = "CR", _("Created")
    RELEASED = "RL", _("Released")
    TECHNICALLY_COMPLETE = "TECH", _("Technically Completed")
    CLOSED = "CL", _("Closed")
    UNKNOWN = "UNK", _("Unknown")


class RawWorkOrder(models.Model):
    """
    Defines the raw data format for data ingested from Vantage for Griffin Work Orders
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    work_order_number = models.CharField("Work order number", max_length=12)
    equipment_number = models.CharField("GCSS-A Equipment Number", max_length=18)
    main_work_center = models.CharField("Main work center completing order", max_length=16, null=True, blank=True)
    work_center = models.CharField("Work center completing the work", max_length=16, null=True, blank=True)
    plant = models.CharField("Plant the work is conducted at", max_length=4, null=True, blank=True)
    description = models.CharField("Work order description", max_length=1024, null=True, blank=True)
    order_status = models.CharField(
        "Work order status",
        max_length=21,
        choices=WorkOrderStatus.choices,
        default=WorkOrderStatus.UNKNOWN,
    )
    date_released = models.DateField("Date released for work", null=True, blank=True)
    date_technically_completed = models.DateField("Date technical work complete", null=True, blank=True)
    date_closed = models.DateField("Date order closed", null=True, blank=True)
    technical_status_code = models.CharField("Work Order technical status", max_length=4, null=True, blank=True)
    technical_status_description = models.CharField(
        "Work Order technical status description", max_length=20, null=True, blank=True
    )
    technical_status_timestamp = models.CharField("Date technical status started", max_length=28, null=True, blank=True)
    project_code = models.CharField("Project code", max_length=3, null=True, blank=True)
    fund_code = models.CharField("Fund code", max_length=2, null=True, blank=True)
    order_priority = models.CharField("Order priority", max_length=3, null=True, blank=True)
    priority = models.CharField("Order priority", max_length=1, null=True, blank=True)
    system_condition = models.CharField("System condition (aka status code)", max_length=1, null=True, blank=True)
    system_condition_datetime = models.CharField("Date system condition started", max_length=28, null=True, blank=True)
    basic_start_datetime = models.CharField("Basic start datetime", max_length=28, null=True, blank=True)
    basic_finish_datetime = models.CharField("Basic finish datetime", max_length=28, null=True, blank=True)
    scheduled_start_datetime = models.CharField("Scheduled start datetime", max_length=28, null=True, blank=True)
    scheduled_finish_datetime = models.CharField("Scheduled finish datetime", max_length=28, null=True, blank=True)
    actual_start_datetime = models.CharField("Actual start datetime", max_length=28, null=True, blank=True)
    confirmed_order_finish_datetime = models.CharField(
        "Confirmed finish datetime", max_length=28, null=True, blank=True
    )
    created_by_user = models.CharField("The user (or process) who created the order", max_length=12)
    created_at_timestamp = models.CharField("The timestamp the order was created", max_length=28)
    last_changed_by_user = models.CharField("The user (or process) who last changed the order", max_length=12)
    last_changed_at_timestamp = models.CharField("The timestamp the order was last changed", max_length=28)
    centaur_sync_timestamp = models.CharField("Timestamp used to control syncing behavior", max_length=28)

    class Meta:
        db_table = "raw_equipment_work_orders"
        verbose_name = "Raw Work Order"
        verbose_name_plural = "Raw Work Orders"

    def __str__(self):
        return "Updated data for {} as of {}".format(self.work_order_number, self.centaur_sync_timestamp)


class WorkOrder(models.Model):
    """
    Defines a Work Order related to an Aircraft
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    # GCSS-A fields
    order_number = models.CharField("Work order number", max_length=12)
    main_work_center = models.CharField("Main work center completing order", max_length=16, null=True, blank=True)
    work_center = models.CharField("Work center completing the work", max_length=16, null=True, blank=True)
    plant = models.CharField("Plant the work is conducted at", max_length=4, null=True, blank=True)
    description = models.CharField("Work order description", max_length=1024, null=True, blank=True)
    order_status = models.CharField(
        "Work order status",
        max_length=4,
        choices=WorkOrderStatus.choices,
        default=WorkOrderStatus.UNKNOWN,
    )
    date_released = models.DateField("Date released for work", null=True, blank=True)
    date_technically_completed = models.DateField("Date technical work complete", null=True, blank=True)
    date_closed = models.DateField("Date order closed", null=True, blank=True)
    technical_status = models.CharField(
        "Work Order technical status",
        max_length=4,
        choices=Fault.TechnicalStatus.choices,
        default=Fault.TechnicalStatus.NO_STATUS,
    )
    technical_status_start_datetime = models.DateTimeField("Date technical status started", null=True, blank=True)
    project_code = models.CharField("Project code", max_length=3, null=True, blank=True)
    fund_code = models.CharField("Fund code", max_length=2, null=True, blank=True)
    order_priority = models.CharField("Order priority", max_length=3, null=True, blank=True)
    system_condition_code = models.CharField("System condition (aka status code)", max_length=1, null=True, blank=True)
    system_condition_start_datetime = models.DateTimeField("Date system condition started", null=True, blank=True)
    basic_start_datetime = models.DateTimeField("Basic start datetime", null=True, blank=True)
    basic_finish_datetime = models.DateTimeField("Basic finish datetime", null=True, blank=True)
    scheduled_start_datetime = models.DateTimeField("Scheduled start datetime", null=True, blank=True)
    scheduled_finish_datetime = models.DateTimeField("Scheduled finish datetime", null=True, blank=True)
    actual_start_datetime = models.DateTimeField("Actual start datetime", null=True, blank=True)
    confirmed_order_finish_datetime = models.DateTimeField("Confirmed finish datetime", null=True, blank=True)
    created_by = models.CharField("The user (or process) who created the order", max_length=12)
    created_at = models.DateTimeField("The timestamp the order was created")
    changed_by = models.CharField("The user (or process) who last changed the order", max_length=12)
    changed_at = models.DateTimeField("The timestamp the order was last changed")
    notes = models.CharField("User provided notes for this work order", max_length=2048, null=True, blank=True)
    last_update_time = models.DateTimeField("Last time the user edited data for this equipment")

    class Meta:
        verbose_name = "Work Order"
        verbose_name_plural = "Work Orders"
        db_table = "work_orders"
        constraints = [models.UniqueConstraint(fields=["order_number"], name="unique work order numbers")]

    def __str__(self):
        return "({}) {}: {}".format(
            self.order_status,
            self.technical_status,
            self.order_number,
        )


class AircraftWorkOrder(WorkOrder):
    """
    Defines a Work Order related to an Aircraft
    """

    aircraft = models.ForeignKey(Aircraft, on_delete=models.PROTECT, related_name="work_orders")

    class Meta:
        verbose_name = "Aircraft Work Order"
        verbose_name_plural = "Aircraft Work Orders"
        db_table = "aircraft_work_orders"

    def __str__(self):
        return "({}) {}: {} on {}".format(
            self.order_status,
            self.technical_status,
            self.order_number,
            self.aircraft.equipment_number,
        )


class AGSEWorkOrder(WorkOrder):
    """
    Defines a Work Order related to an AGSE
    """

    agse = models.ForeignKey(AGSE, on_delete=models.PROTECT, related_name="work_orders")

    class Meta:
        verbose_name = "AGSE Work Order"
        verbose_name_plural = "AGSE Work Orders"
        db_table = "agse_work_orders"

    def __str__(self):
        return "({}) {}: {} on {}".format(
            self.order_status,
            self.technical_status,
            self.order_number,
            self.agse.equipment_number,
        )


class UAVWorkOrder(WorkOrder):
    """
    Defines a Work Order related to an UAV
    """

    uav = models.ForeignKey(UAV, on_delete=models.PROTECT, related_name="work_orders")

    class Meta:
        verbose_name = "UAV Work Order"
        verbose_name_plural = "UAV Work Orders"
        db_table = "uav_work_orders"

    def __str__(self):
        return "({}) {}: {} on {}".format(
            self.order_status,
            self.technical_status,
            self.order_number,
            self.uav.equipment_number,
        )


class RawPurchaseOrder(models.Model):
    """
    Defines Raw Purchase Orders ingested into Griffin

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    work_order_number = models.CharField("Work order purchased against", max_length=12)
    reservation_storage_location = models.CharField("Reserving storage location", max_length=4)
    required_by_date = models.DateField("Required by date")
    quantity_required = models.FloatField("Quantity required")
    quantity_on_hand = models.FloatField("Quantity on Hand")
    unit_of_measure = models.CharField("Quantity Unit of measure", max_length=2)
    quantity_withdrawn = models.FloatField("Quantity Withdrawn")
    dollars_withdrawn = models.FloatField("Dollars withdrawn")
    movement_type = models.CharField("Movement Type", max_length=3)
    reservation_urgency = models.CharField("Reservation Urgency", max_length=1)
    reservation_priority = models.CharField("Reservation Priority", max_length=2)
    line_item_number = models.CharField("Reserved Line Item Number", max_length=6, null=True, blank=True)
    purchase_order_number = models.CharField("Purchase Order Number", max_length=10, null=True, blank=True)
    purchase_order_item_number = models.CharField("Purchase Order Item Number", max_length=3, null=True, blank=True)
    purchase_requisition_number = models.CharField("Purchase Requisition Number", max_length=10)
    purchase_requisition_item_number = models.CharField("Purchase Requisition Item Number", max_length=3)
    requisition_last_changed_by_user = models.CharField("User who last changed requisition", max_length=12)
    requisition_last_changed_on_date = models.DateField("Date requisition last changed")
    storage_location = models.CharField("Ordering Storage Location", max_length=4, null=True, blank=True)
    quantity_ordered = models.FloatField("Quantity Ordered", null=True, blank=True)
    quantity_issued = models.FloatField("Quantity Issued", null=True, blank=True)
    quantity_delivered = models.FloatField("Quantity Delivered", null=True, blank=True)
    quantity_received = models.FloatField("Quantity Received", null=True, blank=True)
    quantity_scheduled = models.FloatField("Quantity Scheduled", null=True, blank=True)
    order_unit_of_measure = models.CharField("Order Unit of Measure", max_length=2, null=True, blank=True)
    price_per_unit = models.FloatField("Price per unit of measure", null=True, blank=True)
    total_price = models.FloatField("Total price", null=True, blank=True)
    item_delivered = models.CharField("Delivery indicator", max_length=1, null=True, blank=True)
    requirement_urgency = models.CharField("Requirement urgency", max_length=1, null=True, blank=True)
    requirement_priority = models.CharField("Requirement priority", max_length=2, null=True, blank=True)
    issuing_storage_location = models.CharField("Issuing storage location", max_length=4, null=True, blank=True)
    functional_area_ekpo = models.CharField("Funding Area; includes MDEP", max_length=15, null=True, blank=True)
    dod_document_number = models.CharField("DOD Document Number", max_length=14, null=True, blank=True)
    order_last_changed_at_datetime = models.CharField("Last changed at datetime", max_length=28, null=True, blank=True)
    order_priority = models.CharField("Order priority", max_length=3, null=True, blank=True)
    purchase_document_created_on_date = models.DateField("Date purchase order created", null=True, blank=True)
    planned_shipment_start_date = models.DateField("Planned Shipment Start Date", null=True, blank=True)
    item_delivery_datetime = models.CharField("Item Delivery Datetime", max_length=28, null=True, blank=True)
    requisition_status = models.CharField("Requisition Status", max_length=2, null=True, blank=True)
    ordered_material_number = models.CharField("Ordered NIIN", max_length=20, null=True, blank=True)
    ordered_material_description = models.CharField(
        "Ordered Material Description",
        max_length=40,
        null=True,
        blank=True,
    )
    ordered_federal_supply_class_code = models.CharField("Ordered FSC Code", max_length=4, null=True, blank=True)
    ordered_source_of_supply = models.CharField("Ordered Source of Supply", max_length=3, null=True, blank=True)
    requisition_material_number = models.CharField("Requisitioned Material Number", max_length=20)
    requisition_material_description = models.CharField(
        "Requisitioned material description",
        max_length=40,
        null=True,
        blank=True,
    )
    requisition_federal_supply_class_code = models.CharField(
        "Requisitioned FSC Code",
        max_length=4,
        null=True,
        blank=True,
    )
    requisition_source_of_supply = models.CharField(
        "Requisitioned Source of Supply",
        max_length=3,
        null=True,
        blank=True,
    )
    parked = models.CharField("Parked indicator", max_length=1, null=True, blank=True)
    centaur_sync_timestamp = models.CharField("Timestamp used to control syncing behavior", max_length=28)

    class Meta:
        db_table = "raw_purchase_orders"
        verbose_name = "Raw Purchase Order"
        verbose_name_plural = "Raw Purchase Orders"

    def __str__(self):
        return "Updated data for req ({}: {}) | order: ({}: {}) as of {}".format(
            self.purchase_requisition_number,
            self.purchase_requisition_item_number,
            self.purchase_order_number,
            self.purchase_order_item_number,
            self.centaur_sync_timestamp,
        )


class PurchaseOrder(models.Model):
    """
    Define Purchase Orders Tracked in Griffin

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    # GCSS-A fields
    # Requisition fields
    requisition_number = models.CharField("Purchase Requisition Number", max_length=10)
    requisition_item_number = models.CharField("Purchase Requisition Item Number", max_length=3)
    storage_location = models.CharField("Ordering Storage Location", max_length=4, null=True, blank=True)
    requisition_status = models.CharField("Requisition Status", max_length=2, null=True, blank=True)
    requisition_material_number = models.CharField("Requisitioned NIIN", max_length=20)
    requisition_material_description = models.CharField(
        "Requisitioned material description", max_length=40, null=True, blank=True
    )
    requisition_federal_supply_class_code = models.CharField(
        "Requisitioned FSC Code", max_length=4, null=True, blank=True
    )
    requisition_source_of_supply = models.CharField(
        "Requisitioned Source of Supply", max_length=3, null=True, blank=True
    )
    parked = models.BooleanField("Parked indicator", null=True, blank=True)
    quantity_withdrawn = models.FloatField("Quantity Withdrawn")
    requisition_last_changed_by_user = models.CharField("User who last changed requisition", max_length=12)
    requisition_last_changed_on_date = models.DateField("Date requisition last changed")

    # Purchase Order Fields
    order_number = models.CharField("Purchase Order Number", max_length=10, null=True, blank=True)
    order_item_number = models.CharField("Purchase Order Item Number", max_length=3, null=True, blank=True)
    ordered_material_number = models.CharField("Ordered NIIN", max_length=20, null=True, blank=True)
    ordered_material_description = models.CharField(
        "Ordered Material Description", max_length=40, null=True, blank=True
    )
    ordered_federal_supply_class_code = models.CharField("Ordered FSC Code", max_length=4, null=True, blank=True)
    ordered_source_of_supply = models.CharField("Ordered Source of Supply", max_length=3, null=True, blank=True)
    order_priority = models.CharField("Order priority", max_length=3, null=True, blank=True)
    quantity_ordered = models.FloatField("Quantity Ordered", null=True, blank=True)
    quantity_issued = models.FloatField("Quantity Issued", null=True, blank=True)
    quantity_delivered = models.FloatField("Quantity Delivered", null=True, blank=True)
    quantity_received = models.FloatField("Quantity Received", null=True, blank=True)
    quantity_scheduled = models.FloatField("Quantity Scheduled", null=True, blank=True)
    order_unit_of_measure = models.CharField("Order Unit of Measure", max_length=2, null=True, blank=True)
    requirement_urgency = models.CharField("Requirement urgency", max_length=1, null=True, blank=True)
    requirement_priority = models.CharField("Requirement priority", max_length=2, null=True, blank=True)
    issuing_storage_location = models.CharField("Issuing storage location", max_length=4, null=True, blank=True)
    dod_document_number = models.CharField("DOD Document Number", max_length=14, null=True, blank=True)
    item_delivered = models.BooleanField("Delivery indicator")
    planned_shipment_start_date = models.DateField("Planned Shipment Start Date", null=True, blank=True)
    item_delivery_datetime = models.DateTimeField("Item Delivery Datetime", null=True, blank=True)
    purchase_document_created_on_date = models.DateField("Date purchase order created", null=True, blank=True)
    order_last_changed_at_datetime = models.DateTimeField("Last changed at datetime", null=True, blank=True)

    # Order funding
    price_per_unit = models.FloatField("Price per unit of measure", null=True, blank=True)
    total_price = models.FloatField("Total price", null=True, blank=True)
    funding_source = models.CharField("Funding Area; includes MDEP", max_length=15, null=True, blank=True)

    # Reservation fields
    work_order_number = models.ForeignKey(
        WorkOrder, on_delete=models.DO_NOTHING, related_name="purchase_orders", null=True, blank=True
    )
    reservation_storage_location = models.CharField("Reserving storage location", max_length=4)
    required_by_date = models.DateField("Required by date")
    quantity_required = models.FloatField("Quantity required")
    quantity_on_hand = models.FloatField("Quantity on Hand")
    unit_of_measure = models.CharField("Quantity Unit of measure", max_length=2)
    dollars_withdrawn = models.FloatField("Dollars withdrawn")
    movement_type = models.CharField("Movement Type", max_length=3)
    reservation_urgency = models.CharField("Reservation Urgency", max_length=1)
    reservation_priority = models.CharField("Reservation Priority", max_length=2)
    line_item_number = models.CharField("Reserved Line Item Number", max_length=6, null=True, blank=True)

    # Centaur Fields
    notes = models.CharField("User provided notes for this purchase order", max_length=2048, null=True, blank=True)
    last_change_time = models.DateTimeField("Last time order was updated")
    last_update_time = models.DateTimeField("Last time the user edited data for this purchase order")

    class Meta:
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"
        db_table = "supply_purchase_orders"
        constraints = [
            models.UniqueConstraint(
                fields=["requisition_number", "requisition_item_number", "order_number", "order_item_number"],
                name="unique order items per requisition",
            )
        ]

    def __str__(self):
        return "Requisition: {}: {} | Order: {}: {}".format(
            self.requisition_number, self.requisition_item_number, self.order_number, self.order_item_number
        )


class RawProvisionalStock(models.Model):
    """
    Defines Raw Provisional Stock ingested into Griffin
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    dodaac = models.CharField("Department of Defense unit, activity", max_length=6, blank=True)
    gcss_internal_material_number = models.CharField("Foreign key, connects source datasets together", max_length=18)
    plant = models.CharField("Indicates whether storage SLOC is a unit's local sloc or an SSA.", max_length=4)
    mrp_area_id = models.CharField("Areas which refer to provisional storage locations", max_length=10)
    storage_location = models.CharField("Where the stock is being stored", max_length=4)
    total_stock = models.FloatField("Total Stock")
    serviceable_stock = models.FloatField(" Stock that is ready for use")
    non_serviceable_stock = models.FloatField("Stock that is not ready for use in its current condition")
    num_serviceable_zero_balance_batches = models.IntegerField("number of serviceable batches that have no stock ")
    num_non_serviceable_zero_balance_batches = models.IntegerField("number of non-serviceable batches with no stock")
    batches = models.JSONField("list that classify the physical state or serviceability of equipment or supplies")
    serviceable_batches = models.JSONField("list of serviceable batches")
    non_serviceable_batches = models.JSONField("list of non serviceable batchesd")
    num_batches = models.IntegerField("Number of batches")
    num_serviceable_batches = models.IntegerField("The number of serviceable batches ")
    num_non_serviceable_batches = models.IntegerField("The number of non serviceable batches")
    is_bench_stock = models.BooleanField("Bench or Stock")
    storage_bin = models.CharField("Sub-location within a larger storage location", max_length=10)
    uic = models.CharField("Unit identification code", max_length=6, blank=True)
    sloc_class = models.CharField("Storage location classification", max_length=4, null=True)
    sloc_types = models.JSONField("Storage Location types")
    sloc_fe_abbr = models.CharField("Force element and associated storage location name", max_length=12, null=True)
    sloc_fe_name = models.CharField("Force element and associated storage location name", max_length=40, null=True)
    ric = models.CharField("Unit's SSA that has to retrograde items to support_ric", max_length=3)
    support_ric = models.CharField("Unit's installation SSA", max_length=3)
    sloc_description = models.CharField("Description of the storage location", max_length=16)
    derived_dodaac = models.CharField("The dodaac dervied from the sloc_fe_name column", max_length=6, null=True)
    sloc_description_uic = models.CharField("The uic from the sloc_description column", max_length=6, null=True)
    mrp_type = models.CharField("MRP type", max_length=2)
    reorder_point = models.FloatField("Reorder point")
    safety_stock = models.FloatField("Safety Stock")
    has_storage_bin = models.BooleanField("Calculated field")
    is_shop_stock = models.BooleanField("Calculated field")
    is_authorized = models.BooleanField("Calculated field")
    authorized_stock = models.FloatField("Stock a unit is authorized to have ")
    material_number = models.CharField("Number identifying what the component is", max_length=23)
    material_number_type = models.CharField("The type of material number", max_length=15, null=True)
    material_description = models.CharField("Description of the component", max_length=45, null=True)
    line_item_number = models.CharField("Identifies the generic nomenclature of equipment item", max_length=6)
    material_number_with_fsc = models.CharField("Material number with four digit FSC", max_length=24)
    material_number_with_fsc_type = models.CharField("Material number + 4 digit FSC type", max_length=13, null=True)
    recovery_code = models.CharField("Recovery code", max_length=1)
    unit_price = models.FloatField("How much the part cost")
    unserviceable_credit_value = models.FloatField("Credit received when turning in a unserviceable part")
    serviceable_credit_value = models.FloatField("Credit received when turning in a usable part")
    serviceable_exchange_credit_price = models.FloatField("Credit received when exchanging repairable part for another")
    sc_name = models.CharField("Physical installation location", max_length=17, null=True)
    total_stock_valuation = models.FloatField("Calculated field - total_stock times the unit_price")
    stock_id = models.CharField(
        "Concatenated field- gcss_internal_material_number + plant + storage_location", max_length=28
    )


class ProvisionalStock(models.Model):
    """
    Defines Provisional Stock ingested into Griffin
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    dodaac = models.CharField("Department of Defense unit, activity", max_length=6, blank=True)
    gcss_internal_material_number = models.CharField("Foreign key, connects source datasets together", max_length=18)
    plant = models.CharField("Indicates whether storage SLOC is a unit's local sloc or an SSA.", max_length=4)
    mrp_area_id = models.CharField("Areas which refer to provisional storage locations", max_length=10)
    storage_location = models.CharField("Where the stock is being stored", max_length=4)
    total_stock = models.FloatField("Total Stock")
    serviceable_stock = models.FloatField(" Stock that is ready for use")
    non_serviceable_stock = models.FloatField("Stock that is not ready for use in its current condition")
    num_serviceable_zero_balance_batches = models.IntegerField("number of serviceable batches that have no stock ")
    num_non_serviceable_zero_balance_batches = models.IntegerField("number of non-serviceable batches with no stock")
    batches = models.JSONField("list that classify the physical state or serviceability of equipment or supplies")
    serviceable_batches = models.JSONField("list of serviceable batches")
    non_serviceable_batches = models.JSONField("list of non serviceable batchesd")
    num_batches = models.IntegerField("Number of batches")
    num_serviceable_batches = models.IntegerField("The number of serviceable batches ")
    num_non_serviceable_batches = models.IntegerField("The number of non serviceable batches")
    is_bench_stock = models.BooleanField("Bench or Stock")
    storage_bin = models.CharField("Sub-location within a larger storage location", max_length=10)
    uic = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        related_name="provisional_stock",
        blank=True,
        db_column="uic",
    )
    sloc_class = models.CharField("Storage location classification", max_length=4, null=True)
    sloc_types = models.JSONField("Storage Location types")
    sloc_fe_abbr = models.CharField("Force element and associated storage location name", max_length=12, null=True)
    sloc_fe_name = models.CharField("Force element and associated storage location name", max_length=40, null=True)
    ric = models.CharField("Unit's SSA that has to retrograde items to support_ric", max_length=3)
    support_ric = models.CharField("Unit's installation SSA", max_length=3)
    sloc_description = models.CharField("Description of the storage location", max_length=16)
    derived_dodaac = models.CharField("The dodaac dervied from the sloc_fe_name column", max_length=6, null=True)
    sloc_description_uic = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        related_name="uic_sloc_description",
        blank=True,
        null=True,
        db_column="sloc_description_uic",
    )
    mrp_type = models.CharField("MRP type", max_length=2)
    reorder_point = models.FloatField("Reorder point")
    safety_stock = models.FloatField("Safety Stock")
    has_storage_bin = models.BooleanField("Calculated field")
    is_shop_stock = models.BooleanField("Calculated field")
    is_authorized = models.BooleanField("Calculated field")
    authorized_stock = models.FloatField("Stock a unit is authorized to have ")
    material_number = models.CharField("Number identifying what the component is", max_length=23)
    material_number_type = models.CharField("The type of material number", max_length=15, null=True)
    material_description = models.CharField("Description of the component", max_length=45, null=True)
    line_item_number = models.CharField("Identifies the generic nomenclature of equipment item", max_length=6)
    material_number_with_fsc = models.CharField("Material number with four digit FSC", max_length=24)
    material_number_with_fsc_type = models.CharField("Material number + 4 digit FSC type", max_length=13, null=True)
    recovery_code = models.CharField("Recovery code", max_length=1)
    unit_price = models.FloatField("How much the part cost")
    unserviceable_credit_value = models.FloatField("Credit received when turning in a unserviceable part")
    serviceable_credit_value = models.FloatField("Credit received when turning in a usable part")
    serviceable_exchange_credit_price = models.FloatField("Credit received when exchanging repairable part for another")
    sc_name = models.CharField("Physical installation location", max_length=17, null=True)
    total_stock_valuation = models.FloatField("Calculated field - total_stock times the unit_price")
    stock_id = models.CharField(
        "Concatenated field- gcss_internal_material_number + plant + storage_location", max_length=28
    )
