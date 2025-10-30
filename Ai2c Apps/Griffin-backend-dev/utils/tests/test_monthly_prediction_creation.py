from datetime import date

from auto_dsr.models import Unit
from fhp.models import MonthlyPrediction


def create_test_monthly_prediction(unit: Unit, every_month_since: date = date(2023, 1, 1)) -> None:
    """
    Creates MonthlyPrediction objects for the given unit (and all of it's subordinate units)
    for every month (reporting_period) since the given data.

    @param unit: (auto_dsr.models.Unit) The Unit to create monthly predictions for
    @param every_month_since: (datetime.date) the date to start creating monthly predictions on
    """
    today = date.today()
    for year in range(every_month_since.year, today.year):
        for month in range(every_month_since.month, 12):
            for uic in unit.subordinate_unit_hierarchy(include_self=True):
                MonthlyPrediction.objects.create(
                    unit=Unit.objects.get(uic=uic),
                    mds="UH-60M",
                    reporting_month=date(year, month, 15),
                    predicted_hours=100.1,
                    model="super duper good model",
                    prediction_date=date(2022, 6, 15),
                )
