from django.core.management.base import BaseCommand

from utils.transform.transform_mtoe import transform_mtoe


class Command(BaseCommand):
    help = "Transform MTOE data from vantage"

    def add_arguments(self, parser):
        # Optional: Define arguments for your command
        parser.add_argument("--fiscal_year", type=str, help="2 digit fiscal year to import")

    def handle(self, *args, **options):
        print("Transforming MTOE")
        print(transform_mtoe(fiscal_year=options["fiscal_year"]))
