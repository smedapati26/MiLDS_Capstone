from django.core.management.base import BaseCommand

from utils.transform.transform_faults import transform_faults


class Command(BaseCommand):
    help = "Transform Faults data from vantage"

    def add_arguments(self, parser):
        # Optional: Define arguments for your command
        parser.add_argument("--all_faults", action="store_true", help="Description of the option")

    def handle(self, *args, **options):
        print("Transforming faults")
        print(transform_faults(all_faults=options["all_faults"]))
