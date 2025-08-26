from forms.models import TrainingType


def create_test_training_type(training_type: str = "Other", description: str = "") -> TrainingType:
    training_type = TrainingType.objects.get_or_create(type=training_type)[0]

    training_type.description = description
    training_type.save()

    return training_type
