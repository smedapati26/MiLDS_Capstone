from django.core.management.base import BaseCommand

from utils.transform.transform_readiness_skill import transform_readiness_skill


class Command(BaseCommand):
    help = "Transform Readiness Skill data from vantage"

    def handle(self, *args, **options):
        print("Transforming Readiness Skill")
        print(transform_readiness_skill())
