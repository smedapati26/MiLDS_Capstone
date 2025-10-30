from django.db import models
from django.utils.translation import gettext_lazy as _

from utils.logo_upload_to import unit_logo_upload_to


class Unit(models.Model):
    """
    Defines a unit. Every unit referenced across PMx applications must have a record in
    this table
    The unit hierarchy is defined by referencing the parent_unit structure.

    ------
    Notes:
    1. short_name : references the common, short reference for a unit (ie 2-1 GSAB)
    2. display_name : the long name for a unit (CO & PLT reference themselves and one level up)
    3. nick_name : a unit's colloquial name (ie. "Wolfhounds")
    """

    class Echelon(models.TextChoices):
        """
        Defines the echelon of Units in the A-MAP database.
        The database stores the short string (max five characters) defined
        as the first in the tuple

        ------
        Notes:
        1. A Squadron is stored as a battalion
        2. A Troop is stored as a Company
        3. For echelons not included in this list, use UNKNOWN
        """

        TEAM = "TM", _("Team")
        SQUAD = "SQD", _("Squad")
        SECTION = "SEC", _("Section")
        PLATOON = "PLT", _("Platoon")
        DETACHMENT = "DET", _("Detachment")
        COMPANY = "CO", _("Company")
        ACTIVITY = "ACT", _("Activity")
        AUGMENTATION = "AUG", _("Augmentation")
        BATTALION = "BN", _("Battalion")
        BRIGADE = "BDE", _("Brigade")
        DIVISION = "DIV", _("Division")
        CORPS = "CORPS", _("Corps")
        MACOM = "MACOM", _("Major Command")
        CENTER = "CNTR", _("Center")
        ARMY = "ARMY", _("Army")
        ELEMENT = "ELEMT", _("Element")
        FMS = "FMS", _("Field Maintenance Shop")
        GROUP = "GROUP", _("Group")
        SCHOOL = "SCH", _("Army School")
        DRU = "DRU", _("Direct Reporting Unit")
        ASCC = "ASCC", _("Army Service Component Command")
        ACOM = "ACOM", _("Army Command")
        HEADQUARTERS = "HQ", _("Headquarters")
        DIRECTORATE = "DIR", _("Directorate")
        INSTITUTE = "INST", _("Institute")
        OFFICE = "OFC", _("Office")
        TASK_FORCE = "TF", _("Task Force")
        AGENCY = "AGENCY", _("Agency")
        DEPARTMENT = "MILSVC", _("Military Service")
        STATE_GUARD = "STATE", _("State Army National Guard")
        FACILITY = "FACILITY", _("Aviation Support Facility")
        MSC = "MSC", _("Major Subordinate Command")
        UNIFIED_COMMAND = "UC", _("Unified Command")
        CONTAINER = "CONTAINER", _("Container for Organizing Units")
        UNKNOWN = "UNK", _("Unknown")

    class Component(models.TextChoices):
        """
        Defines the Army Component of Units in the Unit Manager database.
        The database stores the short string (max five characters) defined
        as the first in the tuple
        """

        ACTIVE = "1", _("Active")
        GUARD = "2", _("Guard")
        RESERVE = "3", _("Reserve")
        TASK_FORCE = "TF", _("Task Force")
        UNKNOWN = "UNK", _("Unknown")

    uic = models.CharField("Unit Identification Code", primary_key=True, max_length=9)
    short_name = models.CharField("Unit Short Name", max_length=64)
    display_name = models.CharField("Unit Display Name", max_length=128)
    nick_name = models.CharField("Unit Nick Name", max_length=64, null=True, blank=True)
    echelon = models.CharField(
        "Unit Echelon",
        max_length=16,
        choices=Echelon.choices,
        default=Echelon.UNKNOWN,
    )
    logo = models.ImageField("Unit logo", upload_to=unit_logo_upload_to, blank=True, null=True)
    compo = models.CharField(
        "Unit Component Classification",
        max_length=16,
        choices=Component.choices,
        default=Component.UNKNOWN,
    )
    state = models.CharField("United States State abbreviation.", max_length=4, null=True, blank=True)
    parent_unit = models.ForeignKey(
        "self", on_delete=models.PROTECT, null=True, blank=True, db_column="parent_unit_uic"
    )
    start_date = models.DateField("Unit origination Date", default="1775-07-14")
    end_date = models.DateField("Unit end Date", null=True, blank=True)
    level = models.IntegerField("This unit's depth in the tree/hierarchy")
    parent_uics = models.JSONField("List of all uics over this one in the hierarchy.", default=list)
    child_uics = models.JSONField("List of all immediate child uics to this unit.", default=list)
    subordinate_uics = models.JSONField("List of all uics subordinate to this one.", default=list)
    as_of_logical_time = models.IntegerField("Logical time of last update")

    def __str__(self):
        return "{} - {}".format(self.uic, self.display_name)

    def subordinate_unit_hierarchy(self, include_self=False):
        """
        A convenience method to fetch a given unit's subordinate units as a list of their UICs

        @param self: (auto_dsr.models.Unit) The Unit object
        @param include_self: (bool) An optional boolean flag defaulting to False of whether to
                             include this unit's uic in the list or not
        @returns ([str]) A list of strings representing the uics of every unit in the hierarchy subordinate to this one
        """
        if include_self:
            return [self.uic, *self.subordinate_uics]
        return self.subordinate_uics

    def set_parent_uics(self, save: bool = True):
        """
        Creates a list of the uics of all unit's higher than this one and saves as
        the parent_uics list value.
        """
        parent_units = []
        current_unit = self.parent_unit

        while current_unit != None:
            parent_units.append(current_unit.uic)
            current_unit = current_unit.parent_unit

        self.parent_uics = parent_units
        if save:
            self.save()

    def set_child_uics(self, save: bool = True):
        """
        Creates a list of all immediate child unit uics and saves it as the child_uics
        value.
        """
        self.child_uics = list(Unit.objects.filter(parent_unit=self).values_list("uic", flat=True))
        if save:
            self.save()

    def set_subordinate_uics(self, save: bool = True):
        """
        Creates a list of all subordinate unit uics and saves it as the subordinate_uics
        value.
        """
        subordinate_uics = []

        # Populate the initial state for the children queue used for traversal
        children = list(Unit.objects.filter(parent_unit=self))

        while children != []:
            current_unit = children.pop(0)
            subordinate_uics.append(current_unit.uic)
            children.extend(list(Unit.objects.filter(parent_unit=current_unit)))

        self.subordinate_uics = subordinate_uics
        if save:
            self.save()

    def set_unit_level(self, save: bool = True):
        """
        Sets the unit level in the hierarchy by moving up the tree until we find
        a root node.
        """
        level = 0
        current_unit = self.parent_unit

        while current_unit != None:
            level += 1
            current_unit = current_unit.parent_unit

        self.level = level
        if save:
            self.save()

    def set_all_unit_lists(self, save: bool = True):
        """
        Sets all three unit hierarchy lists on the existing unit object
        """
        self.set_child_uics(save=False)
        self.set_parent_uics(save=False)
        self.set_subordinate_uics(save=False)
        self.set_unit_level(save=False)
        if save:
            self.save()
