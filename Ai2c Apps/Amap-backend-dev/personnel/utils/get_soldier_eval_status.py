from datetime import date, datetime

from dateutil.relativedelta import relativedelta

from forms.model_utils import EvaluationResult, EvaluationType, EventType
from forms.models import Event
from personnel.models import Soldier


def get_soldier_eval_status(soldier: Soldier):
    """
    Calculate if the recent eval status based on the three month window ending at the end of the soldiers birth month:
        - In Window
            - Complete = 1
            - Not complete (in window and eval not complete)
                - Last Month = -1
                - 1-2 Months Remaining = -2
                - 2-3 Months Remaining = -3

        - Not In Window
            - Complete = 2
            - Overdue (Past current window and eval not complete) = -4

        - Birth Month Not Set (No birth month to calculate) = 0

    Returns: Tuple(recent_eval_date, numerical status, string_status)
    """
    # Get Soldier's most Recent Eval
    recent_annual_eval = (
        Event.objects.filter(
            soldier=soldier,
            event_type__type=EventType.Evaluation,
            evaluation_type__type=EvaluationType.Annual,
            event_deleted=False,
            go_nogo=EvaluationResult.GO,
        )
        .order_by("-date")
        .first()
    )

    recent_annual_eval_date = recent_annual_eval.date if recent_annual_eval else date(1776, 7, 4)
    eval_return = str(recent_annual_eval.date) if recent_annual_eval else None

    # If soldier birthmonth is not set, return 0 - birth month not set
    if soldier.birth_month == "UNK":
        return eval_return, 0, "Birth Month Not Set"

    # Get current year's birthmonth window
    today = date.today()
    current_year = datetime.now().year
    birth_month = datetime.strptime(soldier.birth_month, "%b").month
    birthmonth_window_start = (datetime(current_year, birth_month, 1) + relativedelta(months=-2)).replace(day=1).date()
    birthmonth_window_end = (datetime(current_year, birth_month, 1) + relativedelta(day=1, months=1, days=-1)).date()

    # Check if soldier is in 3 month birthmonth window
    if birthmonth_window_start <= today <= birthmonth_window_end:
        # If soldier is in window, check if their last eval was within the window
        if birthmonth_window_start <= recent_annual_eval_date <= birthmonth_window_end:
            return (eval_return, 1, "In Window - Complete")
        # Otherwise, return number of months remaining in window
        else:
            months_remaining = relativedelta(today, birthmonth_window_end).months
            days_remaining = (birthmonth_window_end - today).days
            return (
                eval_return,
                months_remaining - 1,
                "In Window, {} Days Remaining".format(days_remaining),
            )
    else:
        if today > birthmonth_window_end:
            most_recent_window_start = birthmonth_window_start
        else:
            most_recent_window_start = (
                (datetime(current_year - 1, birth_month, 1) + relativedelta(months=-2)).replace(day=1).date()
            )
        if most_recent_window_start <= recent_annual_eval_date:
            return (eval_return, 2, "Not in Window - Complete")
        else:
            return (eval_return, -4, "Overdue")
