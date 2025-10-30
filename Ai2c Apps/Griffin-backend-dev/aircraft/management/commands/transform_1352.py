from django.core.management.base import BaseCommand

from utils.transform.transform_1352 import transform_1352s


class Command(BaseCommand):
    help = "Transform 1352 data from vantage"

    def handle(self, *args, **options):
        print("Transforming 1352")
        print(transform_1352s())
