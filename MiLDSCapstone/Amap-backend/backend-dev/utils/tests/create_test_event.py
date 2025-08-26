from forms.models import DA_7817, Soldier, Unit, DA_4856, EventType, TrainingType, EvaluationType, AwardType, MOSCode
from forms.model_utils import EventType as OldEventType, EvaluationType as OldEvaluationType, EvaluationResult
from personnel.model_utils import MaintenanceLevel
import datetime


def create_single_test_event(
    soldier: Soldier,
    recorded_by: Soldier,
    uic: Unit,
    recorded_by_legacy: str = "SGT John Wayne",
    id: int = 1,
    date_time: datetime = datetime.date(2023, 12, 25),
    event_type: EventType | None = None,
    training_type: TrainingType | None = None,
    evaluation_type: EvaluationType | None = None,
    go_nogo: EvaluationResult = EvaluationResult.GO,
    award_type: AwardType | None = None,
    gaining_unit: Unit = None,
    comment: str = "TST_COMMENTS",
    total_mx_hours: int = 0,
    maintenance_level: MaintenanceLevel = MaintenanceLevel.ML3,
    mos: MOSCode | None = None,
    attached_da_4856: DA_4856 = None,
    event_deleted: bool = False,
) -> DA_7817:
    """
    Creates a single DA7817 object.

    @param soldier: (Soldier) The Soldier object the new event is to be assigned to
    @param unit: (Unit) The Unit the event belongs to
    @param id: (int) the primary key
    @param date_time
    @param event_type
    @param training_type
    @param evaluation_type
    @param go_nogo
    @param award_type
    @param comment
    @param total_mx_hours
    @param maintenance_level
    @param recorded_by
    @param recorded_by_legacy
    @param attached_da_4856_id
    @param event_deleted

    @ returns (DA_7817)
                The newly created event
    """
    if event_type is None:
        event_type = EventType.objects.get_or_create(type=OldEventType.Evaluation.value)[0]

    if evaluation_type is None and event_type and event_type.type == OldEventType.Evaluation.value:
        evaluation_type = EvaluationType.objects.get_or_create(type=OldEvaluationType.Annual.value)[0]

    return DA_7817.objects.create(
        id=id,
        soldier=soldier,
        uic=uic,
        date=date_time,
        event_type=event_type,
        training_type=training_type,
        evaluation_type=evaluation_type,
        go_nogo=go_nogo,
        award_type=award_type,
        gaining_unit=gaining_unit,
        comment=comment,
        total_mx_hours=total_mx_hours,
        maintenance_level=maintenance_level,
        mos=mos,
        recorded_by=recorded_by,
        recorded_by_legacy=recorded_by_legacy,
        attached_da_4856_id=attached_da_4856,
        event_deleted=event_deleted,
    )
