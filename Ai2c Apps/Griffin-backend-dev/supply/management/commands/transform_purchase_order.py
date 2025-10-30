from django.core.management.base import BaseCommand

from utils.transform.transform_purchase_order import transform_purchase_order


class Command(BaseCommand):
    help = "Transform Purchase Order data from vantage"

    def handle(self, *args, **options):
        print("Transforming Purchase Order")
        print(transform_purchase_order())
