from django.core.management.base import BaseCommand

from utils.transform.transform_readiness_level import transform_readiness_level


class Command(BaseCommand):
    help = "Transform Readiness Level data from vantage"

    def handle(self, *args, **options):
        print("Transforming Readiness Level")
        print(transform_readiness_level())
