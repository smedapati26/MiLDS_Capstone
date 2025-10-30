from forms.models import Event, TrainingType

# Use to consolidate redundant trainings under one TrainingType


def fix_redundant_training_type(old_id: int, new_id: int):
    old_training_type = TrainingType.objects.get(id=old_id)
    new_training_type = TrainingType.objects.get(id=new_id)
    old_trainings = Event.objects.filter(training_type=old_training_type)
    for training in old_trainings:
        training.training_type = new_training_type
        training.save()

    # delete old training
    old_training_type.delete()


fix_redundant_training_type(25, 9)
fix_redundant_training_type(26, 13)
