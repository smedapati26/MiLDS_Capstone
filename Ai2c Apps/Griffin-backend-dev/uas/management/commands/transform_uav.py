from django.core.management.base import BaseCommand

from utils.transform.transform_uav import transform_uav


class Command(BaseCommand):
    help = "Transform UAV data from vantage"

    def handle(self, *args, **options):
        print("Transforming UAV")
        print(transform_uav())
