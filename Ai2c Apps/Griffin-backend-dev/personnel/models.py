from django.db import models

from aircraft.models import Airframe
from auto_dsr.models import Unit, User


class Skill(models.Model):
    """
    Personnel Skills
    """

    asi_code = models.CharField("Skill Code", unique=True, primary_key=True, max_length=8)
    description = models.CharField("Skill Description", max_length=256, blank=True, null=True)

    class Meta:
        db_table = "personnel_skills"


class RAWSkill(models.Model):
    """
    Raw Skill list from vantage.
    """

    asi_code = models.CharField("Skill Code", unique=True, primary_key=True, max_length=8)
    text_description = models.CharField("Skill Description", max_length=256, blank=True, null=True)

    class Meta:
        db_table = "raw_personnel_skills"


class GradeRank(models.Model):
    """
    Grade and Rank codes
    """

    code = models.CharField("Rank Code", unique=True, primary_key=True, max_length=8)
    description = models.CharField("Rank Description", max_length=256, blank=True, null=True)

    class Meta:
        db_table = "personnel_grade_ranks"

    def __str__(self):
        return "{}".format(self.code)


class MTOE(models.Model):
    """
    Modified Table of Organization and Equipment.

    For every unit describing how many personnel the unit is authorized to have.
    These authorizations are done by MOS (Military Occupational Specialty) and ASI (Additional Skill Identifier).
    These authorizations determine how HRC (Human Resources Command) assigns personnel to units and is the most
    powerful tool a commander has to argue for additional personnel to complete their assigned missions.
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    uic = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="unit_mtoes")
    document_number = models.CharField("Unit", max_length=16)
    fiscal_year = models.IntegerField("Fiscal Year")
    change_number = models.IntegerField("Change Number")
    major_army_command_codes = models.CharField("Major Army Command Codes", max_length=4)
    paragraph_no_1 = models.CharField("Paragraph Number 1", max_length=2, blank=True, null=True)
    paragraph_no_3 = models.CharField("Paragraph Number 3", max_length=8, blank=True, null=True)
    required_strength = models.IntegerField("Required Strength", blank=True, null=True)
    authorized_strength = models.IntegerField("Authorized Strength", blank=True, null=True)
    identity_code = models.CharField("Identity Code", max_length=2, blank=True, null=True)
    position_code = models.CharField("Position Code", max_length=8, blank=True, null=True)
    army_mgmt_structure_code = models.CharField("Army Management Structure Code", max_length=16, blank=True, null=True)
    grade = models.ForeignKey(GradeRank, on_delete=models.DO_NOTHING, blank=True, null=True)
    branch = models.CharField("Branch", max_length=4, blank=True, null=True)
    asi_codes = models.ManyToManyField(Skill, related_name="mtoe_skills")
    line_number = models.CharField("Line Number", max_length=6, blank=True, null=True)
    special_qualification_id = models.CharField("Special Qualification Identifier", max_length=2, blank=True, null=True)

    class Meta:
        db_table = "mtoe"
        constraints = [
            models.UniqueConstraint(
                fields=["uic", "paragraph_no_1", "paragraph_no_3", "line_number", "position_code"],
                name="unique_mtoe",
            )
        ]

    @property
    def mos(self):
        """
        Return the MOS for record.
        """
        if self.position_code[:3].isdigit():
            return self.position_code[:4]
        else:
            return self.position_code[:3]


class RAWMTOE(models.Model):
    """
    RAW Data for MTOE
    """

    unit_identification_code = models.CharField("Unit", max_length=8)
    document_number = models.CharField("Unit", max_length=16)
    fiscal_year = models.IntegerField("Fiscal Year")
    change_number = models.IntegerField("Change Number")
    major_army_command_codes = models.CharField("Major Army Command Codes", max_length=4)
    paragraph_no_1 = models.CharField("Paragraph Number 1", max_length=2, blank=True, null=True)
    paragraph_no_3 = models.CharField("Paragraph Number 3", max_length=8, blank=True, null=True)
    required_strength = models.CharField("Required Strength", max_length=4, blank=True, null=True)
    authorized_strength = models.CharField("Authorized Strength", max_length=4, blank=True, null=True)
    identity_code = models.CharField("Identity Code", max_length=2, blank=True, null=True)
    position_code = models.CharField("Position Code", max_length=8, blank=True, null=True)
    army_mgmt_structure_code = models.CharField("Army Management Structure Code", max_length=16, blank=True, null=True)
    grade = models.CharField("Grade", max_length=4, blank=True, null=True)
    branch = models.CharField("Branch", max_length=4, blank=True, null=True)
    asi01 = models.CharField("ASICO 1", max_length=4, blank=True, null=True)
    asi02 = models.CharField("ASICO 2", max_length=4, blank=True, null=True)
    asi03 = models.CharField("ASICO 3", max_length=4, blank=True, null=True)
    asi04 = models.CharField("ASICO 4", max_length=4, blank=True, null=True)
    line_number = models.CharField("Line Number", max_length=6, blank=True, null=True)
    special_qualification_id = models.CharField("Special Qualification Identifier", max_length=2, blank=True, null=True)

    class Meta:
        db_table = "raw_mtoe"


class Soldier(models.Model):
    """
    Readiness Personnel Skill data
    """

    dodid = models.CharField("DOD ID", max_length=10, primary_key=True)
    first_name = models.CharField("First Name", max_length=32, null=True, blank=True)
    last_name = models.CharField("Last Name", max_length=32, null=True, blank=True)
    uic = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, related_name="unit_readiness_skills")
    grade_rank = models.ForeignKey(GradeRank, on_delete=models.DO_NOTHING, null=True, blank=True)
    positions_posco = models.CharField("Position", max_length=8, null=True, blank=True)
    asi_codes = models.ManyToManyField(Skill, related_name="personnel_readiness_skills")
    mos = models.CharField("Primary Specialty", max_length=4, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True)

    class Meta:
        db_table = "soldier"

    def subordinate_soldier_hierarchy(self, include_self=False):
        """
        A convenience method to fetch all subordinate soldiers under this soldier's unit.

        @param self: (auto_dsr.models.Soldier) The Soldier object
        @param include_self: (bool) An optional boolean flag defaulting to False of whether to
                         include this soldier in the queryset or not
        @returns (QuerySet) A queryset of Soldier instances representing all subordinate soldiers
        """
        subordinate_units = self.uic.subordinate_unit_hierarchy(include_self=True)
        subordinate_soldiers = Soldier.objects.filter(uic__in=subordinate_units)

        if include_self:
            subordinate_soldiers = subordinate_soldiers | Soldier.objects.filter(dodid=self.dodid)

        return subordinate_soldiers


class RAWReadinessSkill(models.Model):
    """
    RAW Readiness Personnel Skill data
    """

    uic = models.CharField("UIC", max_length=8)
    dodid = models.CharField("DOD ID", max_length=10, unique=True)
    first_name = models.CharField("First Name", max_length=32, null=True, blank=True)
    last_name = models.CharField("Last Name", max_length=32, null=True, blank=True)
    grade_rank = models.CharField("Grade Rank Code", max_length=4, null=True, blank=True)
    positions_posco = models.CharField("Position", max_length=8, null=True, blank=True)
    asi_codes = models.JSONField("ASI Codes", blank=True, null=True)
    mos = models.CharField("Primary Specialty", max_length=4, blank=True, null=True)

    class Meta:
        db_table = "raw_readiness_skills"


class ReadinessLevel(models.Model):
    """
    Readiness Level Data
    """

    dodid = models.ForeignKey(Soldier, on_delete=models.CASCADE)
    airframe = models.ForeignKey(Airframe, on_delete=models.DO_NOTHING)
    rl_type = models.CharField("Readiness Level Type", max_length=4)
    readiness_level = models.CharField("Readiness Level", max_length=4)
    instructor_dodid = models.CharField("Instructor DOD ID", max_length=10, blank=True, null=True)
    rl_start_date = models.DateTimeField("Readiness Level Start Date/Time")
    rl_end_date = models.DateTimeField("Readiness Level End Date/Time", blank=True, null=True)

    class Meta:
        db_table = "readiness_level"


class RAWReadinessLevel(models.Model):
    """
    RAW Readiness Level Data from Vantage
    """

    dodid = models.CharField("DOD ID", max_length=10)
    acft_mds = models.CharField("Aircraft MDS", max_length=16, blank=True, null=True)
    rl_type = models.CharField("Readiness Level Type", max_length=4)
    readiness_level = models.CharField("Readiness Level", max_length=4)
    instructor_dodid = models.CharField("Instructor DOD ID", max_length=10, blank=True, null=True)
    rl_start_date = models.DateTimeField("Readiness Level Start Date/Time")
    rl_end_date = models.DateTimeField("Readiness Level End Date/Time", blank=True, null=True)

    class Meta:
        db_table = "raw_readiness_level"
