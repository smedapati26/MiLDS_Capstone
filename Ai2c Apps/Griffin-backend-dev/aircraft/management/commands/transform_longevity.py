from django.core.management.base import BaseCommand

from utils.transform.transform_longevity import transform_longevity


class Command(BaseCommand):
    help = "Transform Longevity data from vantage"

    def handle(self, *args, **options):
        print("Transforming longevity")
        print(transform_longevity())
