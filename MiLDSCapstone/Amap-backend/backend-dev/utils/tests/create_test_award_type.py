from forms.models import AwardType


def create_test_award_type(award_type: str = "Other", description: str = "") -> AwardType:
    award_type = AwardType.objects.get_or_create(type=award_type)[0]

    award_type.description = description
    award_type.save()

    return award_type
