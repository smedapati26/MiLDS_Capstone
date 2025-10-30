from forms.models import EvaluationType


def create_test_evaluation_type(evaluation_type: str = "Annual", description: str = "") -> EvaluationType:
    evaluation_type = EvaluationType.objects.get_or_create(type=evaluation_type)[0]

    evaluation_type.description = description
    evaluation_type.save()

    return evaluation_type
