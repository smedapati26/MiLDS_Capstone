from django.core.management.base import BaseCommand

from utils.transform.transform_projections import transform_projections


class Command(BaseCommand):
    help = "Transform Projection data from vantage"

    def handle(self, *args, **options):
        print("Transforming projections")
        print(transform_projections())
