from datetime import datetime, timezone

from django.utils import timezone as dj_tz

JULY_FOURTH_1776 = dj_tz.make_aware(datetime.strptime("July 04, 1776", "%B %d, %Y"), timezone=timezone.utc)

VANTAGE_TIMESTAMP_FMT = "%Y-%m-%d %H:%M:%S"

NAIVE_JULY_FOURTH_1776 = datetime.strptime("July 04, 1776", "%B %d, %Y")

TRANSIENT_UNIT_UIC = "TRANSIENT"

SCHEDULED_WHEN_DISCOVERED = [
    {"value": "O", "meaning": "SPECIAL INSPECTION"},
    {"value": "H", "meaning": "PHASE/PPM INSPECTION"},
    {"value": "A", "meaning": "SCHEDULED MAINTENANCE"},
    {"value": "S", "meaning": "RECONFIGURATION"},
    {"value": "D", "meaning": "DEPOT LEVEL REPAIR"},
    {"value": "W", "meaning": "ACCEPTANCE INSPECTION"},
]

UNSCHEDULED_WHEN_DISCOVERED = [
    {"value": "K", "meaning": "UNSCHEDULED MAINTENANCE"},
    {"value": "B", "meaning": "HANDLING"},
    {"value": "X", "meaning": "DAILY/PMS/PMS1 INSPECTION"},
    {"value": "G", "meaning": "FLIGHT"},
    {"value": "V", "meaning": "POST-FLIGHT INSPECTION"},
    {"value": "T", "meaning": "PREFLIGHT INSPECTION"},
    {"value": "L", "meaning": "MAINTENANCE OPER CHECK"},
    {"value": "Z", "meaning": "PERIODIC INSPECTION"},
    {"value": "M", "meaning": "MAINTENANCE TEST FLIGHT"},
    {"value": "Q", "meaning": "SERVICING"},
    {"value": "E", "meaning": "STORAGE"},
    {"value": "Y", "meaning": "INTERMEDIATE INSPECTION"},
    {"value": "P", "meaning": "DIAGNOSTIC TEST"},
    {"value": "U", "meaning": "THRU FLIGHT INSPECTION"},
    {"value": "N", "meaning": "AOAP RESULTS"},
    {"value": "J", "meaning": "CALIBRATION"},
    {"value": "C", "meaning": "TEST"},
    {"value": "R", "meaning": "REARMAMENT"},
]

WHEN_DISCOVERED = SCHEDULED_WHEN_DISCOVERED + UNSCHEDULED_WHEN_DISCOVERED

MAINTAINER_MOS = [
    "15F",
    "15D",
    "15G",
    "15T",
    "15N",
    "15R",
    "15M",
    "15U",
    "15E",
    "15B",
    "15H",
    "15Y",
    "15K",
    "15L",
    "15Z",
]
