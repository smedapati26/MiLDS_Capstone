from django.core.management.base import BaseCommand

from utils.transform.transform_agse import transform_agse


class Command(BaseCommand):
    help = "Transform AGSE data from vantage"

    def handle(self, *args, **options):
        print("Transforming AGSE")
        print(transform_agse())
