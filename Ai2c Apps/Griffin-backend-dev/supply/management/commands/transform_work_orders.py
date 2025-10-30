from django.core.management.base import BaseCommand

from utils.transform.transform_work_orders import transform_work_orders


class Command(BaseCommand):
    help = "Transform Work Order data from vantage"

    def handle(self, *args, **options):
        print("Transforming Work Order")
        print(transform_work_orders())
