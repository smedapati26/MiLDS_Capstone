from django.core.management.base import BaseCommand
from app.back_end.models import Scenario, ScenarioEvent, Aircraft

class Command(BaseCommand):
    help = "Seed demo scenarios/events"

    def handle(self, *args, **opts):
        sc, _ = Scenario.objects.get_or_create(
            name="Electrical Fault Drill",
            defaults={"description": "NMCM two birds with DC issues"},
        )
        ScenarioEvent.objects.get_or_create(
            scenario=sc,
            aircraft=Aircraft.objects.get(aircraft_pk=920240),
            defaults={"status":"NMCM","rtl":"NRTL","remarks":"…"},
        )
        self.stdout.write(self.style.SUCCESS("Seeded scenario/events"))
