from django.core.management.base import BaseCommand

from utils.transform.transform_skills import transform_skills


class Command(BaseCommand):
    help = "Transform Skills data from vantage"

    def handle(self, *args, **options):
        print("Transforming Skills")
        print(transform_skills())
