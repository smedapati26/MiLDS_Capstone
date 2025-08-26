from datetime import date

from aircraft.models import Aircraft, Message, MessageCompliance
from aircraft.model_utils import MessageComplianceStatuses


def create_single_test_message_compliance(
    message: Message,
    aircraft: Aircraft,
    remarks: str = "Aircraft Compliance Remarks",
    display_on_dsr: bool = False,
    complete: bool = False,
    completed_on: date = date(1998, 5, 11),
    status: MessageComplianceStatuses = MessageComplianceStatuses.UNCOMPLIANT,
):
    """
    Creates a single Message Compliance object and then returns it.
    The model column definitions clarify what each of these values represent.

    @param message: (Message)
    @param aircraft: (Aircraft)
    @param remarks: (str)
    @param display_on_dsr: (bool)
    @param complete: (bool)
    @param completed_on: (date)

    @returns (MessageCompliance)"""
    return MessageCompliance.objects.create(
        message=message,
        aircraft=aircraft,
        remarks=remarks,
        display_on_dsr=display_on_dsr,
        complete=complete,
        completed_on=completed_on,
        status=status,
    )
