from django.core.management.base import BaseCommand

from utils.transform.transform_aircraft import transform_aircraft


class Command(BaseCommand):
    help = "Transform Aircraft data from vantage"

    def handle(self, *args, **options):
        print("Transforming aircraft")
        print(transform_aircraft())
