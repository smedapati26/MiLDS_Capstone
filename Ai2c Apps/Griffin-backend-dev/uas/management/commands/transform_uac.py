from django.core.management.base import BaseCommand

from utils.transform.transform_uac import transform_uac


class Command(BaseCommand):
    help = "Transform UAC data from vantage"

    def handle(self, *args, **options):
        print("Transforming UAC")
        print(transform_uac())
