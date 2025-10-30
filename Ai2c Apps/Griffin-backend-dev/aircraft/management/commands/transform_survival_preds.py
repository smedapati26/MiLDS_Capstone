from django.core.management.base import BaseCommand

from utils.transform.transform_surv_preds import transform_survival_preds


class Command(BaseCommand):
    help = "Transform Aircraft data from vantage"

    def handle(self, *args, **options):
        print("Transforming aircraft")
        print(transform_survival_preds())
