from datetime import datetime, timezone
from django.utils import timezone as dj_tz

JULY_FOURTH_1776 = dj_tz.make_aware(datetime.strptime("July 04, 1776", "%B %d, %Y"), timezone=timezone.utc)

NAIVE_JULY_FOURTH_1776 = datetime.strptime("July 04, 1776", "%B %d, %Y")

TRANSIENT_UNIT_UIC = "TRANSIENT"
