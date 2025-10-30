from django.core.management.base import BaseCommand

from utils.transform.transform_short_life import transform_short_life


class Command(BaseCommand):
    help = "Transform Short Life data from vantage"

    def handle(self, *args, **options):
        print("Transforming Short Life")
        print(transform_short_life())
