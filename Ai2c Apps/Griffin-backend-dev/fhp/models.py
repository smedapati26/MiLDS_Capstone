from django.db import models
from django.utils.translation import gettext_lazy as _

from auto_dsr.models import Unit


class MonthlyProjection(models.Model):
    """
    Monthly flying hour projections for a unit. These are the hours the unit's FHP budget
    are based on.

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, db_column="unit_uic")
    model = models.CharField("Aircraft Model", max_length=16)
    reporting_month = models.DateField("The last day of the reporting period in question")
    projected_hours = models.FloatField("Hours projected to be flown during the given period")
    source = models.CharField("The source providing these projections", max_length=16)

    class Meta:
        db_table = "fhp_monthly_projection"
        constraints = [
            models.UniqueConstraint(
                fields=["unit", "model", "reporting_month"], name="unit_monthly_projections_per_mds"
            )
        ]

    def __str__(self):
        return "{} is projected to fly {} {} hours in the period ending on {}".format(
            self.unit, self.projected_hours, self.model, self.reporting_month
        )


class MonthlyPrediction(models.Model):
    """
    Monthly flying hour predictions for a unit as made by an AI2C model.

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    mds = models.CharField("The airframe the predicted hours are associated with", max_length=16)
    reporting_month = models.DateField("The last day of the reporting period")
    predicted_hours = models.FloatField("Hours predicted to be flown during the given period")
    model = models.CharField("The name of the model that made the prediction", max_length=64)
    prediction_date = models.DateField("The day the predictions were made")

    class Meta:
        db_table = "fhp_monthly_prediction"
        constraints = [
            models.UniqueConstraint(
                fields=["unit", "mds", "reporting_month", "model", "prediction_date"],
                name="mlmodel_unit_monthly_predictions_per_mds_ondate",
            )
        ]

    def __str__(self):
        return "{} predicts {} will fly {} {} hours in the period ending on {}".format(
            self.model, self.unit, self.predicted_hours, self.model, self.reporting_month
        )


class RawAnnualProjection(models.Model):
    """
    The Annual Requested Hours for a unit (as tracked by FORSCOM/USARPAC)

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    unit_type = models.CharField("Unit Type", max_length=8, null=True, blank=True)
    model = models.CharField("Aircraft Model", max_length=16)
    requested_hours = models.IntegerField("Unit Requested hours")
    fiscal_year = models.IntegerField("The year the flying hours were requested for in format: YYYY")
    source = models.CharField("The source providing these projections", max_length=16)

    class Meta:
        db_table = "fhp_raw_annual_projection"
        constraints = [
            models.UniqueConstraint(fields=["unit", "model", "fiscal_year"], name="unit_annual_projection_per_mds")
        ]

    def __str__(self):
        return "{} ({} <{}>) requested {} hours".format(self.unit, self.unit_type, self.model, self.requested_hours)


class RawMonthlyForecast(models.Model):
    """
    The hours FORSCOM forecast the unit would fly for the given reporting month

    ------
    Notes:
    1. reporting_month : the date stored is the final day in the reporting period (the 15th of the month)
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    unit_type = models.CharField("Unit Type", max_length=4, null=True, blank=True)
    model = models.CharField("Aircraft Model", max_length=16)
    forecasted_hours = models.IntegerField("Hours Forecasted")
    reporting_month = models.DateField("Final Day in Reporting Month")
    source = models.CharField("The source providing these projections", max_length=16)

    class Meta:
        db_table = "fhp_raw_monthly_forecast"
        constraints = [
            models.UniqueConstraint(
                fields=["unit", "model", "reporting_month"], name="raw_unit_monthly_projections_per_mds"
            )
        ]

    def __str__(self):
        return "{} ({}) to fly {} hours in period ending on {}".format(
            self.unit, self.model, self.forecasted_hours, self.reporting_month
        )


class RawCostFactor(models.Model):
    """
    The cost factor used to evaluate and align budget dollars to flying hours at different units

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    unit_type = models.CharField("Unit Type", max_length=4, null=True, blank=True)
    model = models.CharField("Aircraft Model", max_length=16)
    cost_factor = models.FloatField("Cost Factor")
    fiscal_year = models.IntegerField("The fiscal year the cost factor was estimated for: YYYY")
    source = models.CharField("The source providing these projections", max_length=16)

    class Meta:
        db_table = "fhp_raw_cost_factor"
        constraints = [
            models.UniqueConstraint(fields=["unit", "model", "fiscal_year"], name="unit_annual_cost_factor_per_mds")
        ]

    def __str__(self):
        return "${}/Flight Hour in {} during FY{}".format(self.cost_factor, self.unit, self.fiscal_year)
