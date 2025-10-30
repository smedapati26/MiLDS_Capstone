from django.core.management.base import BaseCommand

from utils.transform.transform_stock import transform_stock


class Command(BaseCommand):
    help = "Transform stock data from vantage"

    def handle(self, *args, **options):
        print("Transforming stock")
        print(transform_stock())
