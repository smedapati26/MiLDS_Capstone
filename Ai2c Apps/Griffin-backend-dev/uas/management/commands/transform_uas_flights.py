from django.core.management.base import BaseCommand

from utils.transform.transform_uas_flights import transform_uas_flights


class Command(BaseCommand):
    help = "Transform UAS Flights    data from vantage"

    def handle(self, *args, **options):
        print("Transforming UAS Flights")
        print(transform_uas_flights())
