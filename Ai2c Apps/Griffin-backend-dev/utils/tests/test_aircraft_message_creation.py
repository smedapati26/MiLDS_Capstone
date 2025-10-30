from datetime import date

from aircraft.model_utils import MessageClassifications, MessageTypes
from aircraft.models import Aircraft, Message


def create_single_test_aircraft_message(
    number: str = "TST-000",
    type: MessageTypes = MessageTypes.SAFETY,
    classification: MessageClassifications = MessageClassifications.ROUTINE,
    publication_date: date = date(2023, 1, 1),
    compliance_date: date = None,
    confirmation_date: date = None,
    contents: str = None,
    applicable_aircraft: [Aircraft] = None,
) -> Message:
    """
    Creates a single Aircraft Message.

    @param number: (str) The Message number
    @param

    @returns: (Message): The newly created Aircraft Message
    """

    message = Message.objects.create(
        number=number,
        type=type,
        classification=classification,
        publication_date=publication_date,
        compliance_date=compliance_date,
        confirmation_date=confirmation_date,
        contents=contents,
    )

    if applicable_aircraft:
        message.applicable_aircraft.add(applicable_aircraft)

    return message
