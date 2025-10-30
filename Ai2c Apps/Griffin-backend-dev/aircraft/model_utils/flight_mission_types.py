from django.db import models
from django.utils.translation import gettext_lazy as _


class FlightMissionTypes(models.TextChoices):
    """
    Defines the Mission Types of Flights
    """

    TRAINING = "TRAINING", _("Training")
    SERVICE = "SERVICE", _("Service")
    COMBAT = "COMBAT", _("Combat")
    IMMINENT_DANGER = "IMMINENT_DANGER", _("Imminent Danger")
    RELAY = "RELAY", _("Relay")
    CORONAVIRUS_OPERATION = "COVID_OPERATION", _("Coronavirus Operation")
    ACCEPTANCE_TEST_FLIGHT = "ACCEPTANCE_TEST_FLIGHT", _("Acceptance Test Flight")
    EXPERIMENTAL_TEST_FLIGHT = "EXPERIMENTAL_TEST_FLIGHT", _("Experimental Test Flight")
    MAINTENANCE_TEST_FLIGHT = "MAINTENANCE_TEST_FLIGHT", _("Maintenance Test Flight")
    UNKNOWN = "UNKNOWN", _("Unknown")
