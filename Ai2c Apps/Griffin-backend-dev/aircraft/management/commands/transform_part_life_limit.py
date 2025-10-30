from django.core.management.base import BaseCommand

from utils.transform.transform_part_life_limit import transform_part_life_limit


class Command(BaseCommand):
    help = "Transform Part Life Limit data from vantage"

    def handle(self, *args, **options):
        print("Transforming Part Life Limit")
        print(transform_part_life_limit())
