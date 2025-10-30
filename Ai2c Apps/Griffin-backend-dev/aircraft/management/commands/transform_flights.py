from django.core.management.base import BaseCommand

from utils.transform.transform_flights import transform_flights


class Command(BaseCommand):
    help = "Transform Flight data from vantage"

    def handle(self, *args, **options):
        print("Transforming flights")
        print(transform_flights())
