from django.core.management.base import BaseCommand

from utils.data.reset_aircraft_hours import reset_aircraft_hours


class Command(BaseCommand):
    help = "Reset aircraft period flying hours"

    def handle(self, *args, **options):
        print("Resetting aircraft flight hours")
        print(reset_aircraft_hours())
