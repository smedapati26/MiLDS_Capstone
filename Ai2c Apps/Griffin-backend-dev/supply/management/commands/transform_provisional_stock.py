from django.core.management.base import BaseCommand

from utils.transform.transform_provisional_stock import transform_provisional_stock


class Command(BaseCommand):
    help = "Transform Provisional Stock data from vantage"

    def handle(self, *args, **options):
        print("Transforming Provisional Stock")
        print(transform_provisional_stock())
